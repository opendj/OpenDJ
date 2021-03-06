
import { Track } from './../models/track';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { ConfigService } from './config.service';
import { retry, catchError, timeout } from 'rxjs/operators';
import { MusicEvent } from '../models/music-event';
import { UserSessionState } from '../models/usersessionstate';

@Injectable({
    providedIn: 'root'
})
export class FEService {
    private SPOTIFY_PROVIDER_API;
    private PLAYLIST_PROVIDER_API;
    private SERVER_TIMEOUT;
    private EMPTY_TRACK_RESULT: Observable<Track[]> = new Observable();

    constructor(public http: HttpClient, public confService: ConfigService) {
        console.debug('FEService constructor');
        this.SPOTIFY_PROVIDER_API = this.confService.SPOTIFY_PROVIDER_API;
        this.PLAYLIST_PROVIDER_API = this.confService.PLAYLIST_PROVIDER_API;
        this.SERVER_TIMEOUT = this.confService.SERVER_TIMEOUT;
        console.info('FES SERVICE CFG:'
        + '\nSPOTIFY_PROVIDER_API=' + this.SPOTIFY_PROVIDER_API
        + '\nPLAYLIST_PROVIDER_API=' + this. PLAYLIST_PROVIDER_API);
    }

    handleError(error) {
        console.error('FEService: handleError', error);
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
            // server-side error
            if (error.error && error.error.code && error.error.msg) {
                errorMessage = `${error.error.msg} (${error.error.code})`;
            } else {
                if (error.error instanceof Array) {

                    errorMessage = 'Sorry:\n';
                    error.error.forEach(err => {
                        errorMessage = errorMessage + `${error.error.msg} (${error.error.code})\n`;
                    });
                } else {
                    errorMessage = 'Unexpected shit happened - Sorry for that!\n' + JSON.stringify(error);
                }
            }
        }
        window.alert(errorMessage);
        return throwError(errorMessage);
      }

    getCurrentPlaylist(event: MusicEvent): Observable<any> {
        if (!event || !event.eventID) {
            this.handleError('getCurrentPlaylist(): no event?!');
        }
        return this.http.get(this.PLAYLIST_PROVIDER_API
                                + '/events/' + event.eventID + '/playlists/' + event.activePlaylist)
            .pipe(
                timeout(this.SERVER_TIMEOUT),
                retry(1),
                catchError(this.handleError)
          );
    }

    searchTracks(event: MusicEvent, queryString: string): Observable<Track[]> {
        // console.log(`qs: ${queryString}`)
        if (queryString === null || queryString === undefined || queryString.length < 2) {
            // This is not an actually error, but expected behavior.
            // throw new Error('Required parameter queryString was null or undefined or < 2 letters.');
            // If this criteria is not met, we return an empty result:
            return this.EMPTY_TRACK_RESULT;
        }

        return this.http.get<Track[]>(this.SPOTIFY_PROVIDER_API + '/events/' + event.eventID + '/providers/spotify/search?q=' + encodeURIComponent(queryString)).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    addTrack(event: MusicEvent, trackId: string, musicProvider: string, addedBy: string): Observable<any> {

        if (trackId === null || trackId === undefined || musicProvider === null || musicProvider === undefined || addedBy === null || addedBy === undefined) {
            throw new Error('Required parameter track was null or undefined when calling addTrack.');
        }
        return this.http.post<any>(this.PLAYLIST_PROVIDER_API
                                    + '/events/' + event.eventID
                                    + '/playlists/' + event.activePlaylist
                                    + '/tracks', { provider: musicProvider, id: trackId, user: addedBy }
                ).pipe(
                    timeout(this.SERVER_TIMEOUT),
                    retry(1),
                    catchError(this.handleError)
          );
    }

    deleteTrack(event: MusicEvent, trackId: string, index: string, user: UserSessionState): Observable<any> {
        if (trackId === null || trackId === undefined || index === null || index === undefined) {
            throw new Error('Required parameter trackId was null or undefined when calling deleteTrack.');
        }
        return this.http.delete(this.PLAYLIST_PROVIDER_API
                                + '/events/' + event.eventID + '/playlists/' + event.activePlaylist
                                + '/tracks/' + encodeURIComponent(`spotify:${trackId}`)
                                + '?index=' + encodeURIComponent('' + index)
                                + '&user=' + encodeURIComponent(user.username))
            .pipe(
                timeout(this.SERVER_TIMEOUT),
                retry(1),
                catchError(this.handleError)
          );
        // return this.http.delete(this.PLAYLIST_PROVIDER_API + '/events/'+event.eventID+'/playlists/'+event.activePlaylist+'/tracks/' + encodeURIComponent(`spotify:${trackId}`));
    }

    reorderTrack(event: MusicEvent, trackId: string, fromIndex: number, toIndex: number, user: UserSessionState): Observable<any> {
        if (trackId === null || trackId === undefined || fromIndex === null || fromIndex === undefined || toIndex === null || toIndex === undefined) {
            throw new Error('Required parameter track was null or undefined when calling addTrack.');
        }
        return this.http.post(this.PLAYLIST_PROVIDER_API
                                + '/events/' + event.eventID + '/playlists/' + event.activePlaylist
                                + '/reorder', { from: fromIndex, to: toIndex, id: trackId, provider: 'spotify', user: user.username })
            .pipe(
                timeout(this.SERVER_TIMEOUT),
                retry(1),
                catchError(this.handleError)
          );
    }

    playTrack(event: MusicEvent, user: UserSessionState): Observable<any> {
        return this.http.get(this.PLAYLIST_PROVIDER_API + '/events/' + event.eventID + '/playlists/' + event.activePlaylist + '/play?user=' + encodeURIComponent(user.username), {}).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    pauseTrack(event: MusicEvent, user: UserSessionState): Observable<any> {
        return this.http.get(this.PLAYLIST_PROVIDER_API + '/events/' + event.eventID + '/playlists/' + event.activePlaylist + '/pause?user=' + encodeURIComponent(user.username), {}).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    playNextTrack(event: MusicEvent, user: UserSessionState): Observable<any> {
        return this.http.get(this.PLAYLIST_PROVIDER_API + '/events/' + event.eventID + '/playlists/' + event.activePlaylist + '/next?user=' + encodeURIComponent(user.username), {}).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    deletePlaylist(event: MusicEvent, playlistId: string): Observable<any> {
        if (playlistId === null || playlistId === undefined) {
            throw new Error('Required parameter playlistId was null or undefined when calling deletePlaylist.');
        }
        return this.http.delete(this.PLAYLIST_PROVIDER_API + '/events/' + event.eventID + '/playlists/' + encodeURIComponent(playlistId)).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    provideTrackFeedback(event: MusicEvent, track: Track, oldFeedback: string, newFeedback: string, user: UserSessionState): Observable<any> {
        console.debug('begin provideTrackFeedback', track.id, oldFeedback, newFeedback);
        if (!oldFeedback) {
            oldFeedback = '';
        }
        if (!newFeedback) {
            newFeedback = '';
        }

        const url = this.PLAYLIST_PROVIDER_API
        + '/events/' + event.eventID + '/playlists/' + event.activePlaylist
        + '/tracks/' + encodeURIComponent(`${track.provider}:${track.id}`)
        + '/feedback';
        const body = { old: oldFeedback, new: newFeedback, user: user.username };

        console.debug('before post url=%s, body=%s', url, JSON.stringify(body));
        return this.http.post(url, body)
            .pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
            );
    }

    getSpotifyPlaylists(event: MusicEvent): Observable<any> {

        return this.http.get<any>(this.SPOTIFY_PROVIDER_API + '/events/' + event.eventID + '/providers/spotify/playlists').pipe(
            timeout(this.SERVER_TIMEOUT),
            catchError( (error) => {
                console.error('error while getting spotify playlists is ignored - probably spotify credentials not yet activated', error);
                return [];
            } )
          );
    }

    getSpotifyDevices(event: MusicEvent): Observable<any> {
        return this.http.get<any>(this.SPOTIFY_PROVIDER_API + '/events/' + event.eventID + '/providers/spotify/devices').pipe(
            timeout(this.SERVER_TIMEOUT),
            catchError( (error) => {
                console.error('error while getting spotify devices is ignored - probably spotify credentials not yet activated', error);
                return [];
            } )
          );

    }

    setSpotifyDevice(event: MusicEvent, device: string): Observable<any> {
        return this.http.post<any>(
            this.SPOTIFY_PROVIDER_API + '/events/' + event.eventID + '/providers/spotify/devices',
            { currentDevice: device}
            ).pipe(
            timeout(this.SERVER_TIMEOUT),
            catchError(this.handleError)
          );

    }

    increaseSpotifyVolume(event: MusicEvent): Observable<any> {
        return this.modifySpotifyVolume(event, 'inc');
    }
    decreaseSpotifyVolume(event: MusicEvent): Observable<any> {
        return this.modifySpotifyVolume(event, 'dec');
    }

    deleteProvider(event: MusicEvent, provider: any): Observable<any> {
        return this.http.delete<any>(
            this.SPOTIFY_PROVIDER_API + '/events/' + event.eventID + '/providers/' + provider.type + '/' + provider.id,
            ).pipe(
            timeout(this.SERVER_TIMEOUT),
            catchError(this.handleError)
          );

    }

    private modifySpotifyVolume(event: MusicEvent, act: string): Observable<any> {
        return this.http.post<any>(
            this.SPOTIFY_PROVIDER_API + '/events/' + event.eventID + '/providers/spotify/volume',
            { action: act}
            ).pipe(
            timeout(this.SERVER_TIMEOUT),
            catchError(this.handleError)
          );
    }


    /* ------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------ */
    /* ------------------------- CRUD Event ----------------------------------- */
    /* ------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------ */

    createEvent(event: MusicEvent): Observable<MusicEvent> {
        return this.http.post<MusicEvent>(this.PLAYLIST_PROVIDER_API + '/events', event).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    readEvent(eventID: string): Observable<MusicEvent> {
        if (!eventID) {
            eventID = '___prototype___';
        }

        eventID = eventID.toLowerCase();
        return this.http.get<MusicEvent>(this.PLAYLIST_PROVIDER_API + '/events/' + eventID, {}).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    updateEvent(event: MusicEvent): Observable<MusicEvent> {
        return this.http.post<MusicEvent>(this.PLAYLIST_PROVIDER_API + '/events/' + event.eventID, event).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    deleteEvent(eventID: string): Observable<MusicEvent> {
        return this.http.delete<MusicEvent>(this.PLAYLIST_PROVIDER_API + '/events/' + eventID).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }

    validateEvent(event: MusicEvent): Observable<MusicEvent> {
        console.debug('fes-service validateEvent %s - prov=%s', event.eventID, this.PLAYLIST_PROVIDER_API);
        return this.http.post<MusicEvent>(this.PLAYLIST_PROVIDER_API + '/events/' + event.eventID + '/validate', event).pipe(
            timeout(this.SERVER_TIMEOUT),
            retry(1),
            catchError(this.handleError)
          );
    }
}
