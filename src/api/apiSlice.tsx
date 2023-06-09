// Ce fichier correspond à une configuration de l'API RTK-Query pour effectuer 
//des requêtes vers l'API Spotify. 

//Import des dépendances nécessaires
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import {
  SpotifyPlaylist,
  SpotifyTrack,
  User,
  Track,
} from "../types";

//On crée l'API avec createApi
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.spotify.com/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).authentication.accessToken;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({ //type de données renvoyé par la requête
      query: () => ({
        url: "/me",
        method: "GET",
      }),
    }),
    getPlaylists: builder.query<SpotifyPlaylist, void>({
      query: () => ({
        url: "/me/playlists",
        method: "GET",
      }),
    }),
    getPlaylistTracks: builder.query<SpotifyTrack, string>({
      query: (playlistRef) => ({
        url: `${playlistRef}`,
        method: "GET",
      }),
    }),
    getSearchTrackResult: builder.query<Track[], string>({
      query: (search) => ({
        url: `/search?q=${search}&type=track`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        return response.tracks.items;
      },
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetPlaylistsQuery,
  useGetPlaylistTracksQuery,
  useGetSearchTrackResultQuery,
} = apiSlice; // Ces hooks peuvent être utilisés dans les composants 
//React pour effectuer les requêtes et accéder aux résultats.
export default apiSlice.reducer;
