import { Image } from "expo-image";
import { ImageSourcePropType, ImageStyle } from "react-native";

type Props = {
  imgSource: ImageSourcePropType;
  style?: ImageStyle;
};

export default function ImageViewer({ imgSource, style }: Props) {
  return <Image source={imgSource} style={style} />;
}
