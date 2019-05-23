import axios from 'axios';

const HOST = `https://api.song.buzz`;
const NAPSTER_HOST = `https://api.napster.com`;

const NAPSTER_API_KEY = "ZDFhMjNjNWItZjA4OC00NjJhLWFlYWQtYzE2MmUyZDUxOTBi";

export function getTracksMeta(tracks) {
	return axios.get(NAPSTER_HOST + `/v2.2/tracks/${tracks.join(",")}`, { headers: { apiKey : NAPSTER_API_KEY}})
	.then((response) => response.data)
}

export function queryTracks(query) {
	return axios.get(NAPSTER_HOST + `/v2.2/search?query=${query}&isStreamableOnly=true&apikey=${NAPSTER_API_KEY}&type=track`)
	.then((response) => response.data)
}

export function auth(username, password, apiKey, apiSecret) {
	return axios.post(NAPSTER_HOST + `/oauth/token`, {
		username: username,
		password: password,
		grant_type: 'password'
	}, { headers: {Authorization: 'Basic ' + btoa(apiKey + ':' + apiSecret)}})
	.then((response) => response.data)
}

export function updateVenueCurrentTime(venueId, timeProgress, totalTime) {
	return axios.put(HOST + `/venue/${venueId}?time_progress=${timeProgress}&total_time=${totalTime}`)
	.then((response) => response.data)
}

export function venueNextTrack(venueId) {
	return axios.post(HOST + `/venue/${venueId}/next`)
	.then((response) => response.data)
}

export function listVenues(latitude, longitude) {
	return axios.get(HOST + `/venue?latitude=${latitude}&longitude=${longitude}`)
		.then((response) => response.data)
}

export function fetchVenue(venue_id) {
	return axios.get(HOST + `/venue/${venue_id}`)
		.then((response) => response.data)
}

export function createVenue(venue_name, dj_name, host_id, latitude, longitude) {
	return axios.post(HOST + `/venue`, {
		venue_name: venue_name,
		host_name: dj_name,
		host_id: host_id,
		latitude: latitude,
		longitude: longitude
	}).then((response) => response.data)
}

export function closeVenue(venue_id) {
	return axios.delete(HOST + `/venue/${venue_id}`)
		.then((response) => response.data)
}

export function proposeTrack(venue_id, track_id) {
	return axios.put(HOST + `/track/${venue_id}/${track_id}`)
		.then((response) => response.data)
}

export function voteskipVenue(venue_id, user_id) {
	return axios.put(HOST + `/voteskip/${venue_id}/${user_id}`)
		.then((response) => response.data)
}

export function deleteVoteskip(venue_id, user_id) {
	return axios.delete(HOST + `/voteskip/${venue_id}/${user_id}`)
		.then((response) => response.data)
}

export function upvoteTrack(venue_id, track_id, user_id) {
	return axios.put(HOST + `/vote/${venue_id}/${track_id}/${user_id}/upvote`)
		.then((response) => response.data)
}

export function downvoteTrack(venue_id, track_id, user_id) {
	return axios.put(HOST + `/vote/${venue_id}/${track_id}/${user_id}/downvote`)
		.then((response) => response.data)
}

export function deleteVote(venue_id, track_id, user_id) {
	return axios.delete(HOST + `/vote/${venue_id}/${track_id}/${user_id}`)
		.then((response) => response.data)
}