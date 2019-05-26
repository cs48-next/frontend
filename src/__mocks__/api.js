import axios from 'axios';

const HOST = `https://api.song.buzz`;

const venue_listing = {
	venue_id: "venue_id",
	venue_name: "My Venue",	
	host_id : "host_id",
	host_name: "host_name",
	age_ms : 1000,
	distance: 10
}

const venue = {
	id: "venue_id",
	name: "My Venue",
	host_id: "host_id",
	host_name: "host_name",
	created_on: "2019-05-25T23:55:39.588+0000",
	modified_on: "2019-05-25T23:55:39.588+0000",
	time_progress: 0,
	total_time: 0
}

export function getTracksMeta(tracks) {
	return Promise.resolve({ tracks: [] });
}

export function queryTracks(query) {
	const search_response = {
		search: {
			data: {
				tracks: []
			}
		}
	}
	return Promise.resolve(search_response);
}

export function auth(username, password, apiKey, apiSecret) {
	return Promise.resolve({access_token: "access", refresh_token: "refresh"})
}

export function updateVenueCurrentTime(venueId, timeProgress, totalTime) {
	return Promise.resolve({});
}

export function venueNextTrack(venueId) {
	return Promise.resolve({});
}

export function listVenues(latitude, longitude) {
	return Promise.resolve({ venues: [venue_listing] });
}

export function fetchVenue(venue_id) {
	return Promise.resolve(venue);
}

export function createVenue(venue_name, dj_name, host_id, latitude, longitude) {
	return Promise.resolve(venue);
}

export function closeVenue(venue_id) {
	return Promise.resolve({});
}

export function proposeTrack(venue_id, track_id) {
	return Promise.resolve({});

}

export function voteskipVenue(venue_id, user_id) {
	return Promise.resolve({});

}

export function deleteVoteskip(venue_id, user_id) {
	return Promise.resolve({});

}

export function upvoteTrack(venue_id, track_id, user_id) {
	return Promise.resolve({});

}

export function downvoteTrack(venue_id, track_id, user_id) {
	return Promise.resolve({});

}

export function deleteVote(venue_id, track_id, user_id) {
	return Promise.resolve({});

}