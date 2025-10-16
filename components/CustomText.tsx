import React from "react";
import { Text, TextProps } from "react-native";

export default function CustomText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[
        { fontFamily: "SpaceGrotesk", color: "#000" }, // fuente global
        props.style, // esto permite sobrescribir el estilo cuando lo necesites
      ]}
    >
      {props.children}
    </Text>
  );
}
