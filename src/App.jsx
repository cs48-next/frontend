import React, { Component, useEffect } from "react";
import Modal from "react-modal";
import * as moment from "moment";
import Cookies from 'universal-cookie';
import uuid from "uuid";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-regular-svg-icons'

import "./App.css";

import {
  listVenues,
  fetchVenue,
  createVenue,
  getTracksMeta,
  proposeTrack,
  upvoteTrack,
  downvoteTrack,
  deleteVote,
  queryTracks,
  auth
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
              className="venue-card"
              key={venue_id}
            >
              <h4 className="header-lg center-text">
                {Number(distance).toFixed(1)} mi.
              </h4>
              <img
                className="now-playing-album-art"
                src="https://api.napster.com/imageserver/v2/albums/alb.8762246/images/170x170.jpg/"
                alt=""
              />
              <h2 className="center-text">
                <span className="venue-name">{venue_name}</span>
              </h2>

              <ul className="card-list">
                <li key={venue_id + "-host"}>
                  <div>
                    <div className="venue-grid-info">
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

function VenueInfo({
  userId,
  venue,
  venueTrackInfo,
  onProposeOpen,
  onProposeClose,
  onTrackUpvote,
  onTrackDownvote,
  onTrackDeleteVote,
  onTrackVoteskip
}) {

  useEffect(() => {
    if (venue.host_id === userId) {
      console.log('This is your venue!');
      var API_KEY = 'ZDFhMjNjNWItZjA4OC00NjJhLWFlYWQtYzE2MmUyZDUxOTBi';
      var API_SECRET = 'YjdiZWIzMjAtMjY0Yy00NDFmLTkzZWEtZTk4ZjBjMmU4NzQ1';
      var ACCESS_KEY = 'me@keremc.com';
      var ACCESS_SECRET = 'kopekbalik';      

      window.Napster.init({
        consumerKey: API_KEY,
        isHTML5Compatible: true,
        version: 'v2.2',
        player: 'player-frame'
      });
      window.Napster.player.on('ready', function (e) {
        console.log('initialized');
        auth(ACCESS_KEY, ACCESS_SECRET, API_KEY, API_SECRET).then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error.response);
        });
      });
      window.Napster.player.on('error', console.log);

      // do Napster.init
      // 
    } else {
      console.log('This is not your venue!');
    }
  }, [venue, userId]);

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

            var userVote = track.votes.find(vote => vote.user_id === userId);
            var upvoteExists = userVote != null && userVote.upvote;
            var downvoteExists = userVote != null && !userVote.upvote;

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
               
                        <FontAwesomeIcon className={"downvote-button" + (downvoteExists ? " downvote-selected" : "")} icon={faThumbsDown} onClick={() => downvoteExists ? onTrackDeleteVote(trackId) : onTrackDownvote(trackId) }/>
                        <div className="vote-score">{score}</div>

                        <FontAwesomeIcon className={"upvote-button" + (upvoteExists ? " upvote-selected" : "")} icon={faThumbsUp} onClick={() => upvoteExists ? onTrackDeleteVote(trackId) : onTrackUpvote(trackId)} />

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

const StateVenueGrid = "venue_grid";
const StateVenueInfo = "venue_info";

const cookies = new Cookies();

class App extends Component {
  constructor(props) {
    super(props);

    if (cookies.get('user_id') == null) {
      console.log("No userId found, setting");
      cookies.set('user_id', uuid.v4(), { path: '/' });
    }
    var userId = cookies.get('user_id');

    this.state = {
      userId: userId,

      venues: null,
      venue: null,
      venueTrackInfo: null,

      creatingVenue: false,
      creationInProgress: false,
      creationError: null,

      proposingTrack: false,
      proposalError: null,

      trackQueryResults: null,

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
    this.trackDeleteVote = this.trackDeleteVote.bind(this);

    this.trackVoteskip = this.trackVoteskip.bind(this);
    this.trackQueryInputChange = this.trackQueryInputChange.bind(this);
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
    var djId = this.state.userId;

    this.setState({ creationInProgress: true });

    createVenue(
      venueName,
      djName,
      djId,
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
      proposalError: null,
      trackQueryResults: null
    });
  }
  closePropose() {
    this.setState({
      proposingTrack: false,
      proposalError: null,
      trackQueryResults: null
    });
  }
  trackPropose(venueId, trackId) {
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
      });
  }
  trackQueryInputChange(event) {
    var trackQuery = this.trackQuery.value;

    if (this.queryDelayTask != null) {
      clearTimeout(this.queryDelayTask);
    }

    this.queryDelayTask = setTimeout(() => this.runTrackQuery(trackQuery), 250);
  }

  runTrackQuery(query) {
    queryTracks(query).then(response => {
      var tracks = response.search.data.tracks;
      this.setState({trackQueryResults: tracks});    
    }).catch(error => {
      console.log(error.response);
    });
  }

  loadVenues() {
    this.setState({
        venue: null,
        phase: StateVenueGrid
      });

    listVenues(this.props.coords.latitude, this.props.coords.longitude).then(
      response => {
        this.setState({
            venues: response.venues,
            venue: null,
            phase: StateVenueGrid
          });
      }
    );
  }

  venueSelected(venue) {
    this.setState({
        venues: null,
        creatingVenue: false,
        proposingTrack: false,
        phase: StateVenueInfo
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

        this.setState({
            venues: null,
            venue: venue,
            venueTrackInfo: trackInfo,
            creatingVenue: false,
            proposingTrack: false,
            phase: StateVenueInfo
          });
      }).catch(error => {
        console.log(error.response);
      });
    });
  }

  trackUpvote(trackId) {
    var venueId = this.state.venue.id;
    var userId = this.state.userId;
    upvoteTrack(venueId, trackId, userId).then(vote => {
      if (this.state.venue.id === venueId) {
        this.venueSelected(venueId);
      }
    }).catch(error => {
        console.log(error.response);
    });
  }

  trackDownvote(trackId) {
    var venueId = this.state.venue.id;
    var userId = this.state.userId;
    downvoteTrack(venueId, trackId, userId).then(vote => {
      if (this.state.venue.id === venueId) {
        this.venueSelected(venueId);
      }
    }).catch(error => {
        console.log(error.response);
    });
  }

  trackDeleteVote(trackId) {
    var venueId = this.state.venue.id;
    var userId = this.state.userId;
    deleteVote(venueId, trackId, userId).then(_ignore => {
      if (this.state.venue.id === venueId) {
        this.venueSelected(venueId);
      }
    }).catch(error => {
        console.log(error.response);
    });
  }

  trackVoteskip(trackId) {
    console.log("Voteskip track " + trackId);
  }

  render() {
    const {
      userId,
      venues,
      venue,
      venueTrackInfo,

      creatingVenue,
      creationInProgress,
      creationError,

      proposingTrack,
      proposalError,

      trackQueryResults,

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
            autoFocus={false}
            isOpen={proposingTrack}
            onRequestClose={this.closePropose}
            className="venue-create-modal center-text"
            contentLabel="Propose song"
            shouldReturnFocusAfterClose={false}
          >
            <h2 className="center-text">Propose Song</h2>

              <input
                autoFocus={true}
                id="song-search"
                type="text"
                autoComplete="off"
                className="song-propose-input"
                onChange={this.trackQueryInputChange}
                ref={input => (this.trackQuery = input)}
                placeholder="Song name"
              />


            <div className="track-suggest-frame">
                        {proposalError != null ? (
              <span className="error">{proposalError}</span>
            ) : (
              <span className="error-placeholder">_</span>
            )}

            {trackQueryResults != null ? (
              <ul>
                {trackQueryResults.map(track => {
                  return (
                    <li key={'track-suggest-' + track.id} onClick={()=>{this.trackPropose(venue.id, track.id)}}>
                     <div className="track-suggest">
                        <div className="track-suggest-album-art"><img alt="" src={"https://api.napster.com/imageserver/v2/albums/" + track.albumId + "/images/170x170.jpg"}/></div>

                        <div className="track-suggest-info">
                          <div className="track-suggest-name">{track.name}</div>
                          <div className="track-suggest-artist">{track.artistName}</div>
                          <div className="track-suggest-album">{track.albumName}</div>
                          <div className="track-suggest-duration">{track.playbackSeconds === 0 ? "?:??" : moment.utc(track.playbackSeconds * 1000).format("mm:ss")}</div>
                        </div>
                     </div> 
                    </li>
                    );
                })}
              </ul>
            ) : (null)}
            </div>

          </Modal>

          <Modal
            autoFocus={false}          
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
                autoFocus={true}              
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
                    userId={userId}                  
                    venue={venue}
                    venueTrackInfo={venueTrackInfo}
                    onProposeOpen={this.openPropose}
                    onProposeClose={this.closePropose}
                    onTrackUpvote={this.trackUpvote}
                    onTrackDownvote={this.trackDownvote}
                    onTrackDeleteVote={this.trackDeleteVote}
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
