import React, { Component } from "react";
import Modal from "react-modal";
import * as moment from "moment";

import PropTypes from "prop-types";
import "./App.css";

import {
  listVenues,
  fetchVenue,
  createVenue,
  getTracksMeta,
  proposeTrack,
  upvoteTrack,
  downvoteTrack
} from "./api";
import { geolocated } from "react-geolocated";

function VenueGrid({ venues, onVenueSelect }) {
  return (
    <ul className="venue-list">
      {venues.map(
        ({ distance, venue_id, venue_name, age_ms, host_name }, index) => {
          return (
            <div
              onClick={() => onVenueSelect(venue_id)}
              className="card bg-light"
              key={venue_id}
            >
              <h4 className="header-lg center-text">
                {Number(distance).toFixed(1)} mi.
              </h4>
              <img
                className="avatar"
                src="https://api.napster.com/imageserver/v2/albums/alb.8762246/images/170x170.jpg/"
                alt=""
              />
              <h2 className="center-text">
                <span className="venue-name">{venue_name}</span>
              </h2>

              <ul className="card-list">
                <li key={venue_id + "-host"}>
                  <div>
                    <div className="avatar-info">
                      <img
                        className="avatar-icon"
                        src="img/user-avatar.svg"
                        height="22"
                        width="22"
                        alt=""
                      />

                      <span>{host_name == null ? "???" : host_name}</span>
                    </div>
                  </div>
                </li>
                <li key={venue_id + "-created-on"}>
                  <img
                    className="avatar-icon"
                    src="img/circular-clock.svg"
                    height="22"
                    width="22"
                    alt=""
                  />
                  {age_ms === -1
                    ? "???"
                    : moment(new Date().getTime() - age_ms).fromNow()}
                </li>
              </ul>
            </div>
          );
        }
      )}
    </ul>
  );
}
VenueGrid.propTypes = {
  venues: PropTypes.array.isRequired,
  onVenueSelect: PropTypes.func.isRequired
};

function VenueInfo({
  venue,
  venueTrackInfo,
  onProposeOpen,
  onProposeClose,
  onTrackPropose,
  onTrackUpvote,
  onTrackDownvote,
  onTrackVoteskip
}) {
  return (
    <div className="venue-info center-text">
      <div>
        <span>Venue name: {venue.name}</span>
      </div>
      <div>
        <span>Venue host: {venue.host_name}</span>
      </div>
      <div>
        <span>
          Venue created on:{" "}
          {moment(venue.created_on).format("MMMM Do YYYY, h:mm a")}
        </span>
      </div>
      <div className="playlist-header">
        <h2 className="playlist-title">Currently playing</h2>
      </div>

      <div className="playlist-container" />

      <div className="playlist-header">
        <h2 className="playlist-title">Playlist</h2>
      </div>

      <div className="playlist-container">
        <div className="playlist-propose">
          <button
            className="astext playlist-propose-button"
            onClick={() => onProposeOpen()}
          >
            Propose song
          </button>
        </div>

        <ul className="playlist">
          {venue.playlist.map((track, index) => {
            var ordinal = index + 1;
            var trackId = track.track_id;
            var trackInfo = venueTrackInfo[trackId];
            if (trackInfo != null) {
              var score = track.votes
                .map(vote => {
                  return vote.upvote ? 1 : -1;
                })
                .reduce((a, b) => a + b, 0);
              return (
                <li className="track-listing" key={track.track_id}>
                  <div className="track">
                    <div className="track-place">#{ordinal}</div>
                    <div className="album-art">
                      <img
                        alt=""
                        src={
                          "https://api.napster.com/imageserver/v2/albums/" +
                          trackInfo.albumId +
                          "/images/170x170.jpg"
                        }
                      />
                    </div>

                    <div className="track-info">
                      <div className="name">{trackInfo.name}</div>
                      <div className="artist">
                        <span className="bold artist-name">
                          {trackInfo.artistName}
                        </span>
                        <span className="album-name">
                          {" "}
                          - {trackInfo.albumName}
                        </span>
                      </div>
                      <div className="duration">
                        {trackInfo.playbackSeconds === 0
                          ? "?:??"
                          : moment
                              .utc(trackInfo.playbackSeconds * 1000)
                              .format("mm:ss")}
                      </div>

                      <div className="vote-buttons">
                        <button
                          className="upvote-button"
                          onClick={() => onTrackUpvote(trackId)}
                        >
                          +
                        </button>
                        <span className="vote-score">{score}</span>
                        <button
                          className="downvote-button"
                          onClick={() => onTrackDownvote(trackId)}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            } else {
              console.log("Invalid track");
              console.log(track);
              return null;
            }
          })}
        </ul>
      </div>
    </div>
  );
}
VenueInfo.propTypes = {
  venue: PropTypes.object.isRequired,
  venueTrackInfo: PropTypes.object.isRequired,
  onProposeOpen: PropTypes.func.isRequired,
  onProposeClose: PropTypes.func.isRequired,
  onTrackPropose: PropTypes.func.isRequired,
  onTrackUpvote: PropTypes.func.isRequired,
  onTrackDownvote: PropTypes.func.isRequired,
  onTrackVoteskip: PropTypes.func.isRequired
};

const StateVenueGrid = "venue_grid";
const StateVenueInfo = "venue_info";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      venues: null,
      venue: null,
      venueTrackInfo: null,

      creatingVenue: false,
      creationInProgress: false,
      creationError: null,

      proposingTrack: false,
      proposalInProgress: false,
      proposalError: null,

      phase: StateVenueGrid
    };

    this.openCreate = this.openCreate.bind(this);
    this.closeCreate = this.closeCreate.bind(this);
    this.venueCreate = this.venueCreate.bind(this);

    this.loadVenues = this.loadVenues.bind(this);
    this.venueSelected = this.venueSelected.bind(this);

    this.openPropose = this.openPropose.bind(this);
    this.closePropose = this.closePropose.bind(this);
    this.trackPropose = this.trackPropose.bind(this);

    this.trackUpvote = this.trackUpvote.bind(this);
    this.trackDownvote = this.trackDownvote.bind(this);

    this.trackVoteskip = this.trackVoteskip.bind(this);
  }

  componentDidMount() {
    Modal.setAppElement("body");
    if (
      this.state.phase === StateVenueGrid &&
      this.state.venues == null &&
      this.props.coords != null
    ) {
      this.loadVenues();
    }
  }
  componentDidUpdate(prevProps) {
    if (
      this.state.phase === StateVenueGrid &&
      this.state.venues == null &&
      this.props.coords != null &&
      this.props.coords !== prevProps.coords
    ) {
      this.loadVenues();
    }
  }

  openCreate() {
    this.setState({
      creatingVenue: true,
      creationInProgress: false,
      creationError: null
    });
  }

  closeCreate() {
    this.setState({
      creatingVenue: false,
      creationInProgress: false,
      creationError: null
    });
  }

  venueCreate(event) {
    event.preventDefault();
    var venueName = this.inputVenueName.value;
    var djName = this.inputDjName.value;

    this.setState({ creationInProgress: true });

    createVenue(
      venueName,
      djName,
      this.props.coords.latitude,
      this.props.coords.longitude
    )
      .then(venue => {
        this.setState({ creatingVenue: false, creationError: null });

        this.venueSelected(venue.id);
      })
      .catch(error => {
        console.log(error.response);
        this.setState({ creationError: "Bad input!" });
      })
      .then(() => {
        this.setState({ creationInProgress: false });
      });
  }

  openPropose() {
    this.setState({
      proposingTrack: true,
      proposalInProgress: false,
      proposalError: null
    });
  }
  closePropose() {
    this.setState({
      proposingTrack: false,
      proposalInProgress: false,
      proposalError: null
    });
  }
  trackPropose(event) {
    event.preventDefault();
    var venueId = this.state.venue.id;
    var trackId = this.inputTrackId.value;

    this.setState({ proposalInProgress: true });

    proposeTrack(venueId, trackId)
      .then(track => {
        this.setState({ proposingTrack: false, proposalError: null });
        if (this.state.venue.id === venueId) {
          this.venueSelected(venueId);
        }
      })
      .catch(error => {
        console.log(error.response);
        this.setState({ proposalError: "Bad input!" });
      })
      .then(() => {
        this.setState({ proposalInProgress: false });
      });
  }
  loadVenues() {
    this.setState(() => {
      return {
        venue: null,
        phase: StateVenueGrid
      };
    });

    listVenues(this.props.coords.latitude, this.props.coords.longitude).then(
      venues => {
        this.setState(() => {
          return {
            venues: venues,
            venue: null,
            phase: StateVenueGrid
          };
        });
      }
    );
  }

  venueSelected(venue) {
    this.setState(() => {
      return {
        venues: null,
        creatingVenue: false,
        proposingTrack: false,
        phase: StateVenueInfo
      };
    });

    fetchVenue(venue).then(venue => {
      var playlist = venue.playlist;
      var trackIds = playlist.map(track => track.track_id);

      (trackIds.length === 0
        ? Promise.resolve({ tracks: [] })
        : getTracksMeta(trackIds)
      ).then(trackMetaResponse => {
        var trackInfo = {};

        trackMetaResponse.tracks.forEach(trackObj => {
          trackInfo[trackObj.id] = trackObj;
        });

        this.setState(() => {
          return {
            venues: null,
            venue: venue,
            venueTrackInfo: trackInfo,
            creatingVenue: false,
            proposingTrack: false,
            phase: StateVenueInfo
          };
        });
      });
    });
  }

  trackUpvote(trackId) {
    var venueId = this.state.venue.id;
    upvoteTrack(venueId, trackId).then(vote => {
      if (this.state.venue.id === venueId) {
        this.venueSelected(venueId);
      }
    });
  }

  trackDownvote(trackId) {
    var venueId = this.state.venue.id;
    downvoteTrack(venueId, trackId).then(vote => {
      if (this.state.venue.id === venueId) {
        this.venueSelected(venueId);
      }
    });
  }

  trackVoteskip(trackId) {
    console.log("Voteskip track " + trackId);
  }

  render() {
    const {
      venues,
      venue,
      venueTrackInfo,

      creatingVenue,
      creationInProgress,
      creationError,

      proposingTrack,
      proposalInProgress,
      proposalError,

      phase
    } = this.state;

    if (this.props.coords == null) {
      return (
        <div>
          <div className="container">
            <h2 className="center-text">
              Location services are required for song.buzz
            </h2>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="container">
          <Modal
            isOpen={proposingTrack}
            onRequestClose={this.closePropose}
            className="venue-create-modal center-text"
            contentLabel="Propose song"
            shouldReturnFocusAfterClose={false}
          >
            <h2 className="center-text">Track</h2>
            <form
              autoComplete="off"
              className="venue-create-form"
              onSubmit={this.trackPropose}
            >
              <input
                type="text"
                className="venue-create-input"
                ref={input => (this.inputTrackId = input)}
                id="venueName"
                placeholder="Track ID sorry :( FOR NOW!"
              />

              {proposalInProgress ? (
                <button className="venue-create-button button-disabled">
                  Loading
                </button>
              ) : (
                <button className="venue-create-button">Propose</button>
              )}
            </form>

            {proposalError != null ? (
              <span className="error">{proposalError}</span>
            ) : (
              <span className="error-placeholder">_</span>
            )}
          </Modal>

          <Modal
            isOpen={creatingVenue}
            onRequestClose={this.closeCreate}
            className="venue-create-modal center-text"
            contentLabel="Create Venue"
            shouldReturnFocusAfterClose={false}
          >
            <h2 className="center-text">New Venue</h2>
            <form
              autoComplete="off"
              className="venue-create-form"
              onSubmit={this.venueCreate}
            >
              <input
                type="text"
                className="venue-create-input"
                ref={input => (this.inputVenueName = input)}
                id="venueName"
                placeholder="Venue name"
              />
              <input
                type="text"
                className="venue-create-input"
                ref={input => (this.inputDjName = input)}
                id="djName"
                placeholder="DJ name"
              />

              {creationInProgress ? (
                <button className="venue-create-button button-disabled">
                  Loading
                </button>
              ) : (
                <button className="venue-create-button">Create</button>
              )}
            </form>

            {creationError != null ? (
              <span className="error">{creationError}</span>
            ) : (
              <span className="error-placeholder">_</span>
            )}
          </Modal>

          <span className="topnav-title">
            <span className="song">song</span>
            <span className="bold buzz">.buzz</span>
          </span>

          <nav className="topnav">
            <button className="astext" onClick={this.loadVenues}>
              All Venues
            </button>
            <button className="astext topnav-right" onClick={this.openCreate}>
              Create Venue
            </button>
          </nav>

          {(() => {
            switch (phase) {
              case StateVenueGrid:
                return !venues ? (
                  <h2 className="loading-text">Loading venues...</h2>
                ) : (
                  <VenueGrid
                    venues={venues}
                    onVenueSelect={this.venueSelected}
                  />
                );
              case StateVenueInfo:
                return !venue ? (
                  <h2 className="loading-text">Loading venue...</h2>
                ) : (
                  <VenueInfo
                    venue={venue}
                    venueTrackInfo={venueTrackInfo}
                    onProposeOpen={this.openPropose}
                    onProposeClose={this.closePropose}
                    onTrackPropose={this.trackPropose}
                    onTrackUpvote={this.trackUpvote}
                    onTrackDownvote={this.trackDownvote}
                    onTrackVoteskip={this.trackVoteskip}
                  />
                );
              default:
                return "Error";
            }
          })()}
        </div>
      </div>
    );
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: Infinity
  },
  watchPosition: true,
  userDecisionTimeout: null
})(App);
