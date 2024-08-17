import { useQuery } from "react-query";
import {
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  IGetMoviesResult,
  getUpComingMovies,
} from "../api";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

const Wrapper = styled.div`
  background-color: black;
  overflow-x: hidden;
  height: 130vh;
`;

const Loader = styled.div`
  height: 200vh;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 130vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
  overflow: hidden;
`;

const Title = styled.h2`
  font-size: 48px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 20px;
  width: 50%;
`;

const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 145vh; // 높이를 자동으로 설정
  display: flex; // 내부 요소들이 보이도록 설정
  flex-direction: column; // 내부 요소들을 세로로 정렬
  margin-bottom: 20px; // 슬라이더 간 간격을 설정
`;

const SliderNowPlaying = styled.div`
  position: relative;
  height: 50vh;
  top: -100px;
`;

const SliderTopRatedMovies = styled.div`
  position: relative;
  height: 50vh;
  top: -180px;
`;

const SliderUpComingMovies = styled.div`
  position: relative;
  height: 50vh;
  top: -250px;
`;

const SliderPopularMovies = styled.div`
  position: relative;
  height: 50vh;
  top: -350px;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  color: red;
  cursor: pointer;

  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 20px;
    color: white;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: fixed;
  width: 40vw;
  height: 60vh;
  border-radius: 15px;
  overflow: hidden;
  top: 10%;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
`;

const BigTitle = styled.h2`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 28px;
  position: relative;
  top: -60px;
`;

const BigOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  top: -80px;
`;

const NextButton = styled.button`
  position: absolute;
  border-radius: 50%;
  border: none;
  left: 95%;
  top: 50%;
  font-size: 20px;
  background: transparent;
  color: white;
`;

const SliderTitle = styled.h2`
  font-size: 30px;
  font-weight: 600;
`;

const rowVariants = {
  hidden: {
    x: window.outerWidth - 10,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.outerWidth + 10,
  },
};

const boxVariants = {
  normal: { scale: 1 },
  hover: {
    scale: 1.3,
    y: -50,
    transition: { delay: 0.3, type: "tween", duration: 0.2 },
  },
};

const InfoVariants = {
  hover: {
    opacity: 1,
    transition: { delay: 0.3, type: "tween", duration: 0.2 },
  },
};

const offset = 6;

function Home() {
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");

  const useMultipleQuery = () => {
    const nowPlayingMovies = useQuery<IGetMoviesResult>(
      ["movies", "nowPlaying"],
      getNowPlayingMovies
    );
    const popularMovies = useQuery<IGetMoviesResult>(
      ["latest"],
      getPopularMovies
    );
    const topRatedMovies = useQuery<IGetMoviesResult>(
      ["topRated"],
      getTopRatedMovies
    );
    const upComingMovies = useQuery<IGetMoviesResult>(
      ["upComing"],
      getUpComingMovies
    );
    return [nowPlayingMovies, popularMovies, topRatedMovies, upComingMovies];
  };

  const [
    { data: dataNowPlaying, isLoading: isLoadingNowPlaying },
    { data: dataPopular, isLoading: isLoadingPopular },
    { data: dataTopRated, isLoading: isLoadingTopRated },
    { data: dataUpComing, isLoading: isLoadingUpComing },
  ] = useMultipleQuery();

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const increaseNowPlayingIndex = () => {
    if (dataNowPlaying) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = dataNowPlaying?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const increasePopularIndex = () => {
    if (dataPopular) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = dataPopular?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const increaseTopRatedIndex = () => {
    if (dataTopRated) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = dataTopRated?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const increaseUpComingIndex = () => {
    if (dataUpComing) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = dataUpComing?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onBoxClick = (movieId: number) => {
    history.push(`/movies/${movieId}`);
  };

  const onOverlayClick = () => {
    history.push("/");
  };

  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    dataNowPlaying?.results.find(
      (movie) => movie.id === +bigMovieMatch.params.movieId
    ); // +는 string을 number로 변환

  return (
    <Wrapper>
      {isLoadingNowPlaying ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              dataNowPlaying?.results[0].backdrop_path || ""
            )}
          >
            <Title>{dataNowPlaying?.results[0].title}</Title>
            <Overview>{dataNowPlaying?.results[0].overview}</Overview>
          </Banner>

          <SliderWrapper>
            <SliderNowPlaying>
              <SliderTitle>Now Playing</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataNowPlaying?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={movie.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(movie.id)}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseNowPlayingIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderNowPlaying>
            <SliderTopRatedMovies>
              <SliderTitle>Top Rated</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataTopRated?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={movie.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(movie.id)}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseTopRatedIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderTopRatedMovies>

            <SliderUpComingMovies>
              <SliderTitle>Up Coming</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataUpComing?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={movie.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(movie.id)}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseUpComingIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderUpComingMovies>

            <SliderPopularMovies>
              <SliderTitle>Popular</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataPopular?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={movie.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(movie.id)}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increasePopularIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderPopularMovies>
          </SliderWrapper>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                ></Overlay>
                <BigMovie layoutId={bigMovieMatch.params.movieId}>
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black,transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
