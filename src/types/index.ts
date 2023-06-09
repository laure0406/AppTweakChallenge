import { StringifyOptions } from "querystring";

export interface User {
    id: string;
    display_name: string;
    email: string;
    images: Image[];
  }
  export interface Image {
    height: number;
    url: string;
    width: number;
  }
  
export interface SpotifyPlaylist {
  href: string;
  id: string;
  items: Playlists[];
}
  export interface Playlists{
    name: string;
    tracks: SpotifyTrack;
  }
    export interface SpotifyTrack{
      href: string;
      items: SpotifyTrackItem [];

    }
      export interface SpotifyTrackItem {
          track: Track;
      }
      export interface Track {
        id: string;
        album: Album;
        artists: Artist [];
        name:string;
      }
      export interface Album{
        name: string;
        release_date: string;
        images: Image [];
      }
      export interface Artist{
        name:string;
      }


