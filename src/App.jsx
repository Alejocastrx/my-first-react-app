import React, { useEffect, useState } from "react";
import Search from "./components/search.jsx";
import Spinner from "./components/Spinner.jsx";
import Moviecard from "./components/Moviecard.jsx";
import {useDebounce} from "react-use"; 
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState ('');
  const [movieList, setMovieList] = useState ([]);
  const [isLoanding, setsLoanding] = useState (false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState ('');
  const [trendingMovies, setTrendingMovies] = useState ([]);

  useDebounce (() => setDebounceSearchTerm(searchTerm),500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setsLoanding(true);
    setErrorMessage('');
    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
      :`${API_BASE_URL}/discover/movie?sort_by-popularity.desc`;
      
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error ('Failed to fetch movies');
      }

      const data = await response.json();

      console.log(data);

      if(data.Response == 'False') {
        setErrorMessage (data.Error || 'Failed to fetch movies');
        setMovieList ([]);
        return;
      }
      setMovieList(data.results || []);

      updateSearchCount
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setsLoanding (false);
    }
  }

  const loadTrendingMovies = async () => {
    try {const movie = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error){
      console.error (`error fetching trending movies: $(error)`);
    }
  }
  useEffect(() => {
    fetchMovies (debounceSearchTerm);
  },[debounceSearchTerm]);

  useEffect(() => {
    loadTrendingMovies ();
  }, []);

  return (
    <main>
    <div className="pattern"/>
     
    <div className="wrapper">
      <header>
        <img src="public/hero.png" alt="Hero Banner"/>
        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </header>

      {trendingMovies.length > 0 && (
        <section className="trending">
          <h2>Trending Movies</h2>

          <ul>
            {trendingMovies.map((movie, index) => (
              <li key={movie.$id}>
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.tittle} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="all_movies">
        <h2 className="mt-[40px]">All Movies</h2>

        {isLoanding ? (
          <Spinner/>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (
          <ul className="mt-[11px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {movieList.map((movie) => (
                <Moviecard key={movie.id} movie={movie}/>
             ))}
          </ul>
        )
      }
      </section>
    </div>
    </main>
  )
}
export default App