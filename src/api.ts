const API_KEY = "5f799208f7f8f9b2262975acb878fecf";
const BASE_PATH = "https://api.themoviedb.org/3";

interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
}

export interface IMovieDetail {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
  vote_average: number;
  runtime: number;
}

export interface ITvDetail {
  id: number;
  backdrop_path: string;
  poster_path: string;
  name: string;
  overview: string;
  vote_average: number;
  type: string;
}
export interface IGetMoviesResult {
  dates: { minimum: string; maximum: string };
  page: number;
  results: IMovie[];
  total_pages: number;
  total_results: number;
}

interface ITv {
  id: number;
  backdrop_path: string;
  poster_path: string;
  name: string;
  overview: string;
}
export interface IGetTvResult {
  page: number;
  results: ITv[];
  total_pages: number;
  total_results: number;
}

interface IMovieSearch {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  name: string;
  overview: string;
}

export interface IGetMovieSearchResult {
  page: number;
  results: IMovieSearch[];
  total_pages: number;
  total_results: number;
}

interface ITvSearch {
  id: number;
  backdrop_path: string;
  poster_path: string;
  name: string;
  title: string;
  overview: string;
}

export interface IGetTvSearchResult {
  page: number;
  results: ITvSearch[];
  total_pages: number;
  total_results: number;
}

export function getNowPlayingMovies() {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getPopularMovies() {
  return fetch(`${BASE_PATH}/movie/popular?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getTopRatedMovies() {
  return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getUpComingMovies() {
  return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getAiringTodayTV() {
  return fetch(`${BASE_PATH}/tv/airing_today?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getOnTheAirTV() {
  return fetch(`${BASE_PATH}/tv/on_the_air?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getPopularTV() {
  return fetch(`${BASE_PATH}/tv/popular?api_key=${API_KEY}`).then((response) =>
    response.json()
  );
}

export function getTopRatedTV() {
  return fetch(`${BASE_PATH}/tv/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getMovieSearch(
  keyword: string | null
): Promise<IGetMovieSearchResult> {
  return fetch(
    `${BASE_PATH}/search/movie?api_key=${API_KEY}&query=${keyword}`
  ).then((response) => response.json());
}

export function getTvSearch(
  keyword: string | null
): Promise<IGetTvSearchResult> {
  return fetch(
    `${BASE_PATH}/search/tv?api_key=${API_KEY}&query=${keyword}`
  ).then((response) => response.json());
}

export function getMovieById(movieID: number | null): Promise<IMovieDetail> {
  return fetch(`${BASE_PATH}/movie/${movieID}?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getTvById(seriesID: number | null): Promise<ITvDetail> {
  return fetch(`${BASE_PATH}/movie/${seriesID}?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}
