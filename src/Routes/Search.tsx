import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import {
  IGetMovieSearchResult,
  getMovieSearch,
  IGetTvSearchResult,
  getTvSearch,
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
  height: 90vh;
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
  height: 70vh; // 높이를 자동으로 설정
  display: flex; // 내부 요소들이 보이도록 설정
  flex-direction: column; // 내부 요소들을 세로로 정렬
  margin-bottom: 20px; // 슬라이더 간 간격을 설정
`;

const SliderMovieSearched = styled.div`
  position: relative;
  height: 50vh;
  top: -200px;
`;

const SliderTvSearched = styled.div`
  position: relative;
  height: 50vh;
  top: -280px;
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

const BigTv = styled(motion.div)`
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

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");

  const [isClickedMovie, setIsClickedMovie] = useState(false);

  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
  const bigTvMatch = useRouteMatch<{ seriesId: string }>("/tv/:seriesId");

  const useMultipleQuery = () => {
    const movieSearched = useQuery<IGetMovieSearchResult>(
      ["movieSearched"],
      () => getMovieSearch(keyword)
    );
    const tvSearched = useQuery<IGetTvSearchResult>(["tvSearched"], () =>
      getTvSearch(keyword)
    );

    return [movieSearched, tvSearched];
  };

  const [
    { data: dataMovieSearched, isLoading: isLoadingMovieSearched },
    { data: dataTvSearched, isLoading: isLoadingTvSearched },
  ] = useMultipleQuery();

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const increaseMovieSearchedIndex = () => {
    if (dataMovieSearched) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = dataMovieSearched?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const increaseTvSearchedIndex = () => {
    if (dataTvSearched) {
      if (leaving) return;
      toggleLeaving();
      const totalTv = dataTvSearched?.results.length - 1;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onMovieBoxClick = (movieId: number) => {
    history.push(`/movies/${movieId}`);
    setIsClickedMovie(true);
  };

  const onTvBoxClick = (seriesId: number) => {
    history.push(`/tv/${seriesId}`);
    setIsClickedMovie(false);
  };

  const onOverlayClick = () => {
    history.push("/");
  };

  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    dataMovieSearched?.results.find(
      (movie) => movie.id === +bigMovieMatch.params.movieId
    ); // +는 string을 number로 변환

  const clickedTv =
    bigTvMatch?.params.seriesId &&
    dataTvSearched?.results.find((tv) => tv.id === +bigTvMatch.params.seriesId); // +는 string을 number로 변환

  return (
    <Wrapper>
      {isLoadingMovieSearched ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              dataMovieSearched?.results[0].backdrop_path || ""
            )}
          >
            <Title>{dataMovieSearched?.results[0].title}</Title>
            <Overview>{dataMovieSearched?.results[0].overview}</Overview>
          </Banner>
          <SliderWrapper>
            <SliderMovieSearched>
              <SliderTitle>Searched Movies</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataMovieSearched?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={movie.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onMovieBoxClick(movie.id)}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseMovieSearchedIndex}>
                    ▷
                  </NextButton>
                </Row>
              </AnimatePresence>
            </SliderMovieSearched>
            <SliderTvSearched>
              <SliderTitle>Tv Searched</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataTvSearched?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((tv) => (
                      <Box
                        layoutId={tv.id + ""} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={tv.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onTvBoxClick(tv.id)}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseTvSearchedIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderTvSearched>
          </SliderWrapper>
          {isClickedMovie ? (
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
          ) : (
            <AnimatePresence>
              {bigTvMatch ? (
                <>
                  <Overlay
                    onClick={onOverlayClick}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  ></Overlay>
                  <BigTv layoutId={bigTvMatch.params.seriesId}>
                    {clickedTv && (
                      <>
                        <BigCover
                          style={{
                            backgroundImage: `linear-gradient(to top, black,transparent), url(${makeImagePath(
                              clickedTv.backdrop_path,
                              "w500"
                            )})`,
                          }}
                        />
                        <BigTitle>{clickedTv.name}</BigTitle>
                        <BigOverview>{clickedTv.overview}</BigOverview>
                      </>
                    )}
                  </BigTv>
                </>
              ) : null}
            </AnimatePresence>
          )}
        </>
      )}
    </Wrapper>
  );
}

export default Search;
