import { useQuery } from "react-query";
import {
  IGetTvResult,
  ITvDetail,
  getAiringTodayTV,
  getOnTheAirTV,
  getPopularTV,
  getTopRatedTV,
  getTvById,
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

const SliderAiringTodayTV = styled.div`
  position: relative;
  height: 50vh;
  top: -100px;
`;

const SliderOnTheAirTV = styled.div`
  position: relative;
  height: 50vh;
  top: -180px;
`;

const SliderPopularTV = styled.div`
  position: relative;
  height: 50vh;
  top: -250px;
`;

const SliderTopRatedTV = styled.div`
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
  border-radius: 10px;
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

const BigPoster = styled.div`
  width: 250px;
  background-size: cover;
  background-position: center center;
  height: 300px;
  position: absolute;
  left: 20px;
  bottom: 150px;
`;

const BigType = styled.div`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 50px;
  left: 800px;
  top: -35px;
  font-size: 20px;
  border: 1px solid white;
  border-radius: 5px;
  font-weight: 600;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigVoteAvg = styled.div`
  color: yellow;
  padding: 20px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  left: 240px;
  top: -135px;
  font-size: 20px;
  border: 1px solid #b43f3f;
  border-radius: 50%;
  font-weight: 600;
  background-color: ${(props) => props.theme.black.lighter};
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

function Tv() {
  const history = useHistory();
  const bigTvMatch = useRouteMatch<{ seriesId: string }>("/tv/:seriesId");
  const [whichSliderClicked, setWhichSliderClicked] = useState<string>("");
  const [seriesID, setSeriesID] = useState<number>(0);

  const useMultipleQuery = () => {
    const NowAiringTodayTv = useQuery<IGetTvResult>(
      ["tv", "NowAiringToday"],
      getAiringTodayTV
    );
    const OnTheAirTV = useQuery<IGetTvResult>(
      ["tv", "OnTheAir"],
      getOnTheAirTV
    );
    const PopularTV = useQuery<IGetTvResult>(["tv", "Popular"], getPopularTV);
    const TopRatedTV = useQuery<IGetTvResult>(
      ["tv", "TopRated"],
      getTopRatedTV
    );
    return [NowAiringTodayTv, OnTheAirTV, PopularTV, TopRatedTV];
  };

  const [
    { data: dataNowAiringToday, isLoading: isLoadingNowAiringToday },
    { data: dataOnTheAir, isLoading: isLoadingOnTheAir },
    { data: dataPopular, isLoading: isLoadingPopular },
    { data: dataTopRated, isLoading: isLoadingTopRated },
  ] = useMultipleQuery();

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const increaseNowAiringTodayIndex = () => {
    if (dataNowAiringToday) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = dataNowAiringToday?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const increaseOnTheAirIndex = () => {
    if (dataOnTheAir) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = dataOnTheAir?.results.length - 1;
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

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onBoxClick = (seriesId: number, whichSlider: string) => {
    history.push(`/tv/${seriesId}`);
    setWhichSliderClicked(whichSlider);
    setSeriesID(seriesId);
  };

  const { data, isLoading } = useQuery<ITvDetail>(["tv", seriesID], () =>
    getTvById(seriesID)
  );

  const onOverlayClick = () => {
    history.push("/");
  };

  const clickedTv = bigTvMatch?.params.seriesId
    ? data?.id === Number(bigTvMatch.params.seriesId)
      ? data
      : undefined
    : undefined;

  return (
    <Wrapper>
      {isLoadingNowAiringToday ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              dataNowAiringToday?.results[1].backdrop_path || ""
            )}
          >
            <Title>{dataNowAiringToday?.results[1].name}</Title>
            <Overview>{dataNowAiringToday?.results[1].overview}</Overview>
          </Banner>

          <SliderWrapper>
            <SliderAiringTodayTV>
              <SliderTitle>Now Airing Today</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataNowAiringToday?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((tv) => (
                      <Box
                        layoutId={tv.id + "NowAiringToday"} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={tv.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(tv.id, "NowAiringToday")}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseNowAiringTodayIndex}>
                    ▷
                  </NextButton>
                </Row>
              </AnimatePresence>
            </SliderAiringTodayTV>
            <SliderOnTheAirTV>
              <SliderTitle>On The Air</SliderTitle>
              <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <Row
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  {dataOnTheAir?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((tv) => (
                      <Box
                        layoutId={tv.id + "OnTheAir"} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={tv.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(tv.id, "OnTheAir")}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseOnTheAirIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderOnTheAirTV>

            <SliderPopularTV>
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
                    .map((tv) => (
                      <Box
                        layoutId={tv.id + "Popular"} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={tv.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(tv.id, "Popular")}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increasePopularIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderPopularTV>

            <SliderTopRatedTV>
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
                    .map((tv) => (
                      <Box
                        layoutId={tv.id + "TopRated"} // layoutId must be a string이여서 movie.id를 string으로 변환
                        key={tv.id}
                        whileHover="hover"
                        initial="normal"
                        onClick={() => onBoxClick(tv.id, "TopRated")}
                        variants={boxVariants}
                        transition={{ type: "tween" }}
                        bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      >
                        <Info variants={InfoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                  <NextButton onClick={increaseTopRatedIndex}>▷</NextButton>
                </Row>
              </AnimatePresence>
            </SliderTopRatedTV>
          </SliderWrapper>
          <AnimatePresence>
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                ></Overlay>
                <BigTv
                  layoutId={bigTvMatch.params.seriesId + whichSliderClicked}
                >
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
                      <BigPoster
                        style={{
                          backgroundImage: `linear-gradient(to top, black,transparent), url(${makeImagePath(
                            clickedTv.poster_path,
                            "w500"
                          )})`,
                        }}
                      ></BigPoster>
                      <BigType>{clickedTv.type}</BigType>
                      <BigVoteAvg>
                        {clickedTv.vote_average.toFixed(2)}
                      </BigVoteAvg>
                      <BigTitle>{clickedTv.name}</BigTitle>
                      <BigOverview>{clickedTv.overview}</BigOverview>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}
export default Tv;
