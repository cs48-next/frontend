import axios from 'axios';

const HOST = `https://api.song.buzz`;
const NAPSTER_HOST = `https://api.napster.com/v2.2/`;

const NAPSTER_API_KEY = "ZDFhMjNjNWItZjA4OC00NjJhLWFlYWQtYzE2MmUyZDUxOTBi";

export function getTracksMeta(tracks) {
	return axios.get(NAPSTER_HOST + `/tracks/${tracks.join(",")}`, { headers: { apiKey : NAPSTER_API_KEY}})
	.then((response) => response.data)
}

export function listVenues (latitude, longitude) {
	return axios.get(HOST + `/venue?latitude=${latitude}&longitude=${longitude}`)
		.then((response) => response.data.venues)
}

export function fetchVenue (venue_id) {
	return axios.get(HOST + `/venue/${venue_id}`)
		.then((response) => response.data)
}

export function createVenue(venue_name, dj_name, latitude, longitude) {
	return axios.post(HOST + `/venue`, {
		venue_name: venue_name,
		host_name: dj_name,
		latitude: latitude,
		longitude: longitude
	}).then((response) => response.data)
}

export function proposeTrack(venue_id, track_id) {
	return axios.put(HOST + `/track/${venue_id}/${track_id}`)
		.then((response) => response.data)
}

export function upvoteTrack(venue_id, track_id) {
	return axios.put(HOST + `/vote/${venue_id}/${track_id}/upvote`)
		.then((response) => response.data)
}

export function downvoteTrack(venue_id, track_id) {
	return axios.put(HOST + `/vote/${venue_id}/${track_id}/downvote`)
		.then((response) => response.data)
}