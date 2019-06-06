import React from "react";
import { Box } from "../../components/primitives";
import { Flex, Heading, Text, Button } from "rebass";
import {
  milisecondsToHourFormat,
  milisecondsToMinutes,
  minutesToMiliseconds
} from "../../../utils/timeOperations";

function OpenGateButtons({ onClick, items }) {
  return items.map((item, index) => {
    if (index === 0) {
      return (
        <Button
          bg="#484848"
          color="#fafafa"
          py={3}
          px={4}
          mr={1}
          borderRadius="2px"
          fontSize="1"
          fontWeight="200"
          onClick={() => {
            onClick(item.time);
          }}
        >
          <span id="btn-session-minutes">
            {milisecondsToMinutes(item.time)}
          </span>
          min
        </Button>
      );
    }
    return (
      <Button
        bg="transparent"
        border="1px solid"
        borderColor="#ccc"
        color="#484848"
        py={3}
        px={4}
        mr={1}
        borderRadius="2px"
        fontSize="1"
        fontWeight="200"
        onClick={() => {
          onClick(item.time);
        }}
      >
        <span id="btn-session-minutes">{milisecondsToMinutes(item.time)}</span>
        min
      </Button>
    );
  });
}
export function GatedView({ info }) {
  const milisecondsRemaining = info.totalTime - info.accumulatedTime;
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={1}
      css={{
        minHeight: "100vh"
      }}
      id="gated"
    >
      <Box as="header">
        <Heading fontSize="6" color="#363636" letterSpacing="0.05rem" mb="1">
          You've been gated with{" "}
          <span id="time-remaining">
            {milisecondsToHourFormat(milisecondsRemaining)}
          </span>
          minutes left.
          <span className="time-wrapper">
            <span className="time-label" />
            <span id="time-elapsed">
              {milisecondsToHourFormat(info.accumulatedTime)}
            </span>
            /
            <span id="time-total">
              {milisecondsToHourFormat(info.totalTime)}
            </span>
          </span>
        </Heading>
        <Text fontSize={2} color="#767676" letterSpacing="0.05rem">
          You can only access this website if you set a duration for your
          session. And if you have enough time left.
          <br />
          <br />
          Don't worry about leaving too little time for a next session. I'll
          account for that and make time reccommendations.
        </Text>
      </Box>
      <Box mt={2} className="content" id="buttons-wrapper">
        <OpenGateButtons
          items={[
            { time: Math.min(minutesToMiliseconds(25), milisecondsRemaining) },
            { time: Math.min(minutesToMiliseconds(50), milisecondsRemaining) }
          ]}
        />
      </Box>
    </Flex>
  );
}
