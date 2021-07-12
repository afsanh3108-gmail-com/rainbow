import GraphemeSplitter from 'grapheme-splitter';
import { get } from 'lodash';
import {
  removeFirstEmojiFromString,
  returnStringFirstEmoji,
} from '../helpers/emojiHandler';
import { address } from '../utils/abbreviations';
import { addressHashedEmoji } from '../utils/defaultProfileUtils';
import networkTypes from './networkTypes';

export function getAccountProfileInfo(
  selectedWallet,
  walletNames,
  network,
  accountAddress
) {
  if (!selectedWallet) {
    return {};
  }

  if (!accountAddress) {
    return {};
  }

  if (!selectedWallet?.addresses?.length) {
    return {};
  }

  const accountENS = get(walletNames, `${accountAddress}`);

  const selectedAccount = selectedWallet.addresses.find(
    account => account.address === accountAddress
  );

  if (!selectedAccount) {
    return {};
  }
  const { label, color, image } = selectedAccount;

  const accountName =
    removeFirstEmojiFromString(
      network === networkTypes.mainnet
        ? label || accountENS || address(accountAddress, 4, 4)
        : label === accountENS
        ? address(accountAddress, 4, 4)
        : label || address(accountAddress, 4, 4)
    ).join('') || address(accountAddress, 4, 4);

  const emojiAvatar = returnStringFirstEmoji(label);

  const accountSymbol = new GraphemeSplitter().splitGraphemes(
    emojiAvatar || addressHashedEmoji(accountAddress)
  )[0];
  const accountColor = color;
  const accountImage = image;

  return {
    accountAddress,
    accountColor,
    accountENS,
    accountImage,
    accountName,
    accountSymbol,
  };
}