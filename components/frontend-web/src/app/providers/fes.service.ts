import { Track, TrackDTO } from './../models/track';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root'
})
export class FEService {

    SPOTIFY_PROVIDER_API =  'http://dev.opendj.io/api/provider-spotify/v1';

    constructor( public http: HttpClient ) {}

    searchTracks(queryString: string): Observable<Track[]> {
        if (queryString === null || queryString === undefined || queryString.length < 2 ) {
            throw new Error('Required parameter queryString was null or undefined or < 2 letters.');
        }
        return this.http.get<Track[]>(this.SPOTIFY_PROVIDER_API + '/searchTrack?event=4711&q=' + encodeURIComponent(queryString));
    }

    addTrack(track: TrackDTO): Observable<any> {
        if (track === null || track === undefined) {
            throw new Error('Required parameter track was null or undefined when calling addTrack.');
        }
        return this.http.post(this.SPOTIFY_PROVIDER_API + '/events/0/playlists/0/tracks', track);
    }

    deleteTrack(trackId: string): Observable<any> {
        if (trackId === null || trackId === undefined) {
            throw new Error('Required parameter trackId was null or undefined when calling deleteTrack.');
        }
        return this.http.delete(this.SPOTIFY_PROVIDER_API + '/events/0/playlists/0/tracks/' + encodeURIComponent(trackId));
    }

    // reorderTrack(fromIndex: number, toIndex: number): Observable<any> {
    //     if (fromIndex === null || fromIndex === undefined) {
    //         throw new Error('Required parameter track was null or undefined when calling addTrack.');
    //     }

    //     // TODO: DanielF says: I need not the fromIndex, but the trackID, because the fromIndex might have changed
    //     // meanwhile on the server side (imagine two concurrent edits). adding an syntax error here for ortwin to notice!
    //     // READ COMMENT ABOVE AND FIX ME PLEASE
    //     // TODO: DanielF: get is not suitable for a mutator, I suggest to use patch(preferred, because of MODIFY semantic),put or post here:
    //     return this.http.patch(this.SPOTIFY_PROVIDER_API +
    //         '/events/0/playlists/0/reorder?from=' + encodeURIComponent(fromIndex) +
    //         '&to=' + encodeURIComponent(toIndex))
    // }

    playTrack(trackId: string): Observable<any> {
        if (trackId === null || trackId === undefined) {
            throw new Error('Required parameter trackId was null or undefined when calling deleteTrack.');
        }
        return this.http.put(this.SPOTIFY_PROVIDER_API + '/events/0/playlists/0/play', { track: trackId });
    }

    pauseTrack(): Observable<any> {
        return this.http.put(this.SPOTIFY_PROVIDER_API + '/events/0/playlists/0/pause', {});
    }

 // tslint:disable-next-line:max-line-length
 /*   DanielF says: there is no difference between "pause" and "stop". Lets make it play/pause, because sound more like music then start/stop
    stopTrack(): Observable<any> {
        return this.http.put(this.SPOTIFY_PROVIDER_API + '/events/0/playlists/0/stop', {});
    }
*/

    playNextTrack(): Observable<any> {
        return this.http.put(this.SPOTIFY_PROVIDER_API + '/events/0/playlists/0/next', {});
    }

    deletePlaylist(playlistId: string): Observable<any> {
        if (playlistId === null || playlistId === undefined) {
            throw new Error('Required parameter playlistId was null or undefined when calling deletePlaylist.');
        }
        return this.http.delete(this.SPOTIFY_PROVIDER_API + '/events/0/playlists/' + encodeURIComponent(playlistId));
    }

}