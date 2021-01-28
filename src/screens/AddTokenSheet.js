import { useRoute } from '@react-navigation/native';
import { toLower } from 'lodash';
import React, { useCallback } from 'react';
import { StatusBar } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Divider from '../components/Divider';
import TouchableBackdrop from '../components/TouchableBackdrop';
import { ButtonPressAnimation } from '../components/animations';
import { CoinIcon } from '../components/coin-icon';
import { Centered, Column, Row } from '../components/layout';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import { Emoji, Text } from '../components/text';
import { DefaultTokenLists } from '../references/';
import {
  useAccountSettings,
  useDimensions,
  useUserLists,
} from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import { colors, position } from '@rainbow-me/styles';
import { haptics } from '@rainbow-me/utils';

const Container = styled(Centered).attrs({
  direction: 'column',
})`
  ${position.cover};
  ${({ deviceHeight, height }) =>
    height ? `height: ${height + deviceHeight}` : null};
`;

const RemoveButton = styled(ButtonPressAnimation)`
  background-color: ${colors.alpha(colors.red, 0.06)};
  border-radius: 15;
  height: 30;
  padding-left: 6;
  padding-right: 10;
  padding-top: 5;
  margin-left: 8;
  top: -2;
`;

const ListButton = styled(ButtonPressAnimation)`
  padding-bottom: ${({ alreadyAdded }) => (alreadyAdded ? 9 : 15)};
  padding-top: 15;
`;

const ListEmoji = styled(Emoji).attrs({
  size: 'large',
})`
  margin-top: 1;
  margin-right: 6;
`;

const WRITEABLE_LISTS = ['watchlist', 'favorites'];

export const sheetHeight = android ? 410 : 394;

export default function AddTokenSheet() {
  const { goBack } = useNavigation();
  const { height: deviceHeight } = useDimensions();
  const { network } = useAccountSettings();
  const { favorites, lists, updateList } = useUserLists();
  const insets = useSafeArea();
  const {
    params: { item },
  } = useRoute();

  const isTokenInList = useCallback(
    listId => {
      if (listId === 'favorites') {
        return !!favorites.find(
          token => toLower(token.address) === toLower(item.address)
        );
      } else {
        const list = lists.find(list => list.id === listId);
        return !!list.tokens.find(
          token => toLower(token) === toLower(item.address)
        );
      }
    },
    [favorites, item.address, lists]
  );

  return (
    <Container deviceHeight={deviceHeight} height={sheetHeight} insets={insets}>
      {ios && <StatusBar barStyle="light-content" />}
      {ios && <TouchableBackdrop onPress={goBack} />}

      <SlackSheet
        additionalTopPadding={android}
        contentHeight={sheetHeight}
        scrollEnabled={false}
      >
        <Centered direction="column">
          <Column marginTop={16}>
            <CoinIcon address={item.address} size={50} symbol={item.symbol} />
          </Column>
          <Column marginBottom={4} marginTop={12}>
            <Text
              align="center"
              color={colors.alpha(colors.blueGreyDark, 0.8)}
              letterSpacing="roundedMedium"
              size="large"
              weight="bold"
            >
              {item.name}
            </Text>
          </Column>
          <Column marginBottom={24}>
            <Text
              align="center"
              color={colors.blueGreyDarker}
              letterSpacing="roundedMedium"
              size="larger"
              weight="heavy"
            >
              Add to List
            </Text>
          </Column>

          <Centered marginBottom={9}>
            <Divider color={colors.rowDividerExtraLight} inset={[0, 143.5]} />
          </Centered>

          <Column align="center" marginBottom={8}>
            {DefaultTokenLists[network]
              .filter(list => WRITEABLE_LISTS.indexOf(list.id) !== -1)
              .map(list => {
                const alreadyAdded = isTokenInList(list.id);
                const handleAdd = () => {
                  if (alreadyAdded) return;
                  updateList(item.address, list.id, !alreadyAdded);
                  haptics.notificationSuccess();
                };
                const handleRemove = () => {
                  updateList(item.address, list.id, false);
                  haptics.notificationSuccess();
                };
                return (
                  <ListButton
                    alreadyAdded={alreadyAdded}
                    key={`list-${list.id}`}
                    onPress={handleAdd}
                  >
                    <Row>
                      <ListEmoji name={list.emoji} />
                      <Text
                        color={
                          alreadyAdded
                            ? colors.alpha(colors.blueGreyDark, 0.6)
                            : colors.appleBlue
                        }
                        size="larger"
                        weight="bold"
                      >
                        {list.name}
                      </Text>
                      {alreadyAdded && (
                        <RemoveButton onPress={handleRemove}>
                          <Text
                            align="center"
                            color={colors.red}
                            letterSpacing="roundedTight"
                            size="lmedium"
                            weight="bold"
                          >
                            􀈔 Remove
                          </Text>
                        </RemoveButton>
                      )}
                    </Row>
                  </ListButton>
                );
              })}
          </Column>

          <SheetActionButtonRow>
            <SheetActionButton
              color={colors.white}
              fullWidth
              label="Cancel"
              onPress={goBack}
              size="big"
              textColor={colors.alpha(colors.blueGreyDark, 0.8)}
              weight="bold"
            />
          </SheetActionButtonRow>
        </Centered>
      </SlackSheet>
    </Container>
  );
}