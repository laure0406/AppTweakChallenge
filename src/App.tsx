import "./App.css";
import { FC, ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { authSelectors } from "./containers/auth/selectors";
import { useGetUserQuery, useGetPlaylistsQuery, useGetPlaylistTracksQuery, useGetSearchTrackResultQuery } from "./api/apiSlice";
import { Track, SpotifyTrackItem } from "./types";

const App: FC = (): ReactElement => {
  //Dark Mode
  const [darkMode, setDarkMode] = useState(false); 
  const toggleDarkMode = () => {setDarkMode(!darkMode);}; //fonction pour changer en dark mode

  //Acess Token
  const accessToken = useSelector(authSelectors.getAccessToken);

  //User
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>(""); 
  const [showUserInfo, setShowUserInfo] = useState(false);

  const { data: user } = useGetUserQuery(undefined, { skip: !accessToken });
  useEffect(() => {
    if (user) {
      setUserName(user.display_name);
      setUserEmail(user.email);
      setImageUrl(user.images[0].url);
    }
  }, [user]);

  const handleProfileImageClick = () => {
    setShowUserInfo(!showUserInfo);
  };

  // User Playlist
  const [playlistNames, setPlaylistNames] = useState<string[]>([]);
  const [playlistRef, setPlaylistRef] = useState<string[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [sortedTracks, setSortedTracks]=useState<SpotifyTrackItem[]>([]);

  const { data: userPlaylist } = useGetPlaylistsQuery(undefined, { skip: !accessToken });
  useEffect(() => {
    if (userPlaylist) {
      const names: string[] = [];
      const refs: string[] = [];
      userPlaylist.items.forEach((playlist) => {
        names.push(playlist.name);
        refs.push(playlist.tracks.href);
      });
      setPlaylistNames(names); //récupérer le nom des playlists...
      setPlaylistRef(refs); //...ainsi que leur référence
    }
  }, [userPlaylist]);

  const { data: userPlaylistTrack } = useGetPlaylistTracksQuery(
    selectedPlaylist ? playlistRef[playlistNames.indexOf(selectedPlaylist)] || "" : "",
    { skip: !accessToken }
  );

  useEffect(() => {
    if (userPlaylistTrack) {
      setSortedTracks(userPlaylistTrack.items); //au début les chansons ne sont pas triées
    }
  }, [userPlaylistTrack]);

  const handleSort = (column: string) => {
    if (!userPlaylistTrack) { //si userPlaylistTrack n'est pas défini on ne fait rien
      return;
    }
  
    // Copie des éléments de la playlist dans un nouveau tableau car on ne peut définir 
    // un set pour userPlaylistTrack car c'est déja une réponse au query.
    const tracksCopy = [...userPlaylistTrack.items]; //... => copie des éléments de userPlaylistTrack.items

    // Tri en fonction de la colonne sélectionnée
    switch (column) { //switch case en fonction de la column sur laquelle on clique
      case 'release_date': //si on clique sur la case date de sortie
        tracksCopy.sort((a, b) => {
          //conversion des dates en getTime pour pouvoir faire la soustraction
          const dateA = new Date(a.track.album.release_date).getTime();
          const dateB = new Date(b.track.album.release_date).getTime();
          return dateA - dateB;
        });
        break;
      case 'title': //si on clique sur la case titre
        tracksCopy.sort((a, b) => {
          return a.track.name.localeCompare(b.track.name);
        });
        break;
      case 'artist': //si on clique sur case artistes
        tracksCopy.sort((a, b) => {
          const artistA = a.track.artists?.[0].name || '';
          const artistB = b.track.artists?.[0].name || '';
          return artistA.localeCompare(artistB);
        });
        break;
      default:
        // Aucune colonne de tri n'a été spécifiée, on ne fait rien
        return;
    }
  
    // Mise à jour des données triées dans la copie des tracks de la playlist
    setSortedTracks(tracksCopy);
  };

  
  //Recherche chanson
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data: userSearch } = useGetSearchTrackResultQuery(searchValue, { skip: !accessToken });

  useEffect(() => {
    if (userSearch) {
      /*vérification
      console.log("recherche: ", searchValue)
      console.log("resultat: ", userSearch[0].name, userSearch[0].artists[0].name);*/
      setSearchResults(userSearch);
    }
  }, [userSearch]);


  return (
    <body>
    <div className={`App ${darkMode ? "dark-mode" : ""}`}> {/*Dark mode sinon App*/}
      <header className="App-header">
        <table className="table-header">
          <tbody>
            <td>Dark Mode: </td>
            <td>
              <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} /> {/*appel de toggleDarkMode si on check le switch */}
              <span className="slider round" >
                <table className="table-logo">
                  <tbody>
                    <td><span className="moon">&#9790;</span> </td>
                    <td><span className="sun">&#9728;</span></td>
                  </tbody>
                </table>
              </span>
            </label> 
            </td>
             <td><b>MON SPOTIFY</b> </td>
             <td></td>
          </tbody>
        </table>
      </header>
        <div id="search">
          <input 
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Rechercher une chanson"
          />
          { isSearchFocused && searchResults.length > 0 && (
            <table className="search-results-table">
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((track) => (
                  <tr key={track.id}>
                    <td className="album-image-cell">
                      <img src={track.album.images[0].url} alt="Album" />
                    </td>
                    <td>
                      <div className="track-name">{track.name}</div>
                      <div className="artist-name">
                      {track.artists?.map((artist) => artist.name).join(", ")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div id="playlist">
          <div className="sort">
            <table className="table-sort">
              <tbody>
                <td>Trier par (ordre croissant)    :</td>
                <td onClick={() => handleSort('title')}> Titre </td>
                <td onClick={() => handleSort('artist')}> Artistes </td>
                <td onClick={() => handleSort('release_date')}> Date de sortie </td>
              </tbody>
            </table>
          </div>
          <select onChange={(e) => setSelectedPlaylist(e.target.value)}>
            <option value="" className="placeholder-option">
              Sélectionnez une playlist
            </option>
            {playlistNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div id="profile-image-container" className={showUserInfo ? "active" : ""}>
          <img src={imageUrl} onClick={handleProfileImageClick} alt="Profile" />
          {showUserInfo && (
            <div className="user-info">
              <p>
                <b>Connecté.e en tant que:</b>
              </p>
              <p>Nom: {userName}</p>
              <p>Email: {userEmail}</p>
            </div>
          )}
        </div>
        {selectedPlaylist && userPlaylistTrack && (
          <div className="playlist-track-display">
            <table className="table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Album</th>
                  <th className="release-date-column">Date de sortie</th>
                </tr>
              </thead>
              <tbody>
                {sortedTracks.map((track) => (
                  <tr key={track.track.id}>
                    <td className="track">
                      <table>
                        <tbody> 
                          <td>  <img src={track.track.album.images[0].url} alt="Album" /> </td>
                          <td>  <div className="track-name">
                                  {track.track.name}
                                </div>
                                <div className="artist-name">
                                  {track.track.artists?.map((artist) => artist.name).join(", ")}
                                </div>
                          </td>
                        </tbody>
                      </table>
                    </td>
                    <td>{track.track.album.name}</td>
                    <td>{track.track.album.release_date}  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
    </body>
  );
};

export default App;
