/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Card } from "@uifabric/react-cards";
import { Stack, IStackTokens, Text } from "office-ui-fabric-react";
import { MetadataObject } from "./Utilities/CardViewer.types";

function CardItem(props: MetadataObject) {
  return (
    <Card aria-label="Option">
      <Card.Item>
        <Text variant="xxLarge">{props.name}</Text>
      </Card.Item>
      <Card.Item>
        <Text variant="mega">{props.count}</Text>
      </Card.Item>
    </Card>
  );
}
function CardViewer(props: [MetadataObject]): any {
  // export class CardVerticalExample extends React.Component {
  // public render(): JSX.Element {
  const objectJson = Object.values(props);

  const sectionStackTokens: IStackTokens = { childrenGap: 30, padding: "m" };

  return (
    <Stack horizontal tokens={sectionStackTokens} wrap={true} horizontalAlign="center" padding="10">
      {objectJson.length > 0 &&
        objectJson
          .filter((element) => element.count > 0)
          .map((element) => <CardItem key={element.name} count={element.count} name={element.name} />)}
    </Stack>
  );
  // }
}

export default CardViewer;
