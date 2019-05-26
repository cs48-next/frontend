import React from "react";
import ReactDOM from "react-dom";
import App, { VenueInfo } from "./App";

import { render, waitForElement } from "react-testing-library";
import waitUntil from "async-wait-until";

it("renders venue listing", async done => {
  const { getByText } = render(<App />);
  await waitForElement(() => getByText("My Venue"));
  expect(getByText("All Venues")).toBeInTheDocument();
  expect(getByText("Create Venue")).toBeInTheDocument();

  done();
});

it("renders venue info", async done => {
  const venue = {
    id: "venue_id",
    name: "My Venue",
    host_id: "host_id",
    host_name: "host_name",
    created_on: "2019-05-25T23:55:39.588+0000",
    modified_on: "2019-05-25T23:55:39.588+0000",
    time_progress: 0,
    total_time: 0,
    playlist: []
  }
  const trackInfo = {}
  const authData = {}
  const { getByText } = render(
    <VenueInfo
      userId={"host_id"}
      venue={venue}
      currentTime={0}
      getCurrentTrack={jest.fn(x => 5)}
      totalTime={0}
      authData={authData}
      isFetchingNextTrack={jest.fn(x => false)}
      venueTrackInfo={trackInfo}
      onNextTrack={jest.fn()}
      isScrubbingTrack={false}
      getTotalTime={jest.fn(x => 5)}
      getCurrentTime={jest.fn(x => 5)}
      scrubX={0}
      needsSeek={false}
      onSeekDone={jest.fn(x => 5)}
      onProposeOpen={jest.fn(x => 5)}
      openVenueClose={jest.fn(x => 5)}
      closeVenueClose={jest.fn(x => 5)}
      onProposeClose={jest.fn(x => 5)}
      onTrackUpvote={jest.fn(x => 5)}
      onTrackDownvote={jest.fn(x => 5)}
      onTrackDeleteVote={jest.fn(x => 5)}
      onTrackVoteskip={jest.fn(x => 5)}
      onTrackDeleteVoteskip={jest.fn(x => 5)}
      adminProgressBarStart={jest.fn(x => 5)}
      adminProgressBarStop={jest.fn(x => 5)}
      adminProgessBarDrag={jest.fn(x => 5)}
      updateCurrentTime={jest.fn(x => 5)}
      songPlaying={false}
      needsSongPlay={false}
      needsSongPause={false}
      afterSongPause={jest.fn(x => 5)}
      afterSongPlay={jest.fn(x => 5)}
      preSongPause={jest.fn(x => 5)}
      preSongPlay={jest.fn(x => 5)}
    />
  );
  await waitForElement(() => getByText("My Venue"));

  done();
});
