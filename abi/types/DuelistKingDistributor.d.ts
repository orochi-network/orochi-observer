/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface DuelistKingDistributorInterface extends ethers.utils.Interface {
  functions: {
    "batchMigrate(address,bool,bool,bytes)": FunctionFragment;
    "compute(bytes)": FunctionFragment;
    "getDomain()": FunctionFragment;
    "getGenesisEdition(uint256)": FunctionFragment;
    "getRegistry()": FunctionFragment;
    "getRemainingBox(uint256)": FunctionFragment;
    "issueGenesisCard(address,uint256)": FunctionFragment;
    "mintBoxes(address,uint256,uint256)": FunctionFragment;
    "openBoxes(bytes)": FunctionFragment;
    "setRemainingBoxes(uint256,uint256)": FunctionFragment;
    "upgradeCard(uint256,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "batchMigrate",
    values: [string, boolean, boolean, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "compute", values: [BytesLike]): string;
  encodeFunctionData(functionFragment: "getDomain", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getGenesisEdition",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRemainingBox",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "issueGenesisCard",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mintBoxes",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "openBoxes",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setRemainingBoxes",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeCard",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "batchMigrate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "compute", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getDomain", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getGenesisEdition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRemainingBox",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "issueGenesisCard",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mintBoxes", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "openBoxes", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setRemainingBoxes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "upgradeCard",
    data: BytesLike
  ): Result;

  events: {
    "CardUpgradeFailed(address,uint256)": EventFragment;
    "CardUpgradeSuccessful(address,uint256,uint256)": EventFragment;
    "NewGenesisCard(address,uint256,uint256)": EventFragment;
    "SetRemainingBoxes(uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CardUpgradeFailed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CardUpgradeSuccessful"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewGenesisCard"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetRemainingBoxes"): EventFragment;
}

export class DuelistKingDistributor extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  listeners<T, G>(
    eventFilter?: TypedEventFilter<T, G>
  ): Array<TypedListener<T, G>>;
  off<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  on<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  once<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  removeListener<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  removeAllListeners<T, G>(eventFilter: TypedEventFilter<T, G>): this;

  queryFilter<T, G>(
    event: TypedEventFilter<T, G>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<T & G>>>;

  interface: DuelistKingDistributorInterface;

  functions: {
    batchMigrate(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "batchMigrate(address,bool,bool,bytes)"(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    compute(
      data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "compute(bytes)"(
      data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    getDomain(overrides?: CallOverrides): Promise<[string]>;

    "getDomain()"(overrides?: CallOverrides): Promise<[string]>;

    getGenesisEdition(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "getGenesisEdition(uint256)"(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getRegistry(overrides?: CallOverrides): Promise<[string]>;

    "getRegistry()"(overrides?: CallOverrides): Promise<[string]>;

    getRemainingBox(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "getRemainingBox(uint256)"(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    issueGenesisCard(
      owner: string,
      id: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "issueGenesisCard(address,uint256)"(
      owner: string,
      id: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    mintBoxes(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "mintBoxes(address,uint256,uint256)"(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    openBoxes(
      nftIds: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "openBoxes(bytes)"(
      nftIds: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setRemainingBoxes(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setRemainingBoxes(uint256,uint256)"(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    upgradeCard(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "upgradeCard(uint256,uint256)"(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  batchMigrate(
    owner: string,
    isMint: boolean,
    isBox: boolean,
    nftIdList: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "batchMigrate(address,bool,bool,bytes)"(
    owner: string,
    isMint: boolean,
    isBox: boolean,
    nftIdList: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  compute(data: BytesLike, overrides?: Overrides): Promise<ContractTransaction>;

  "compute(bytes)"(
    data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  getDomain(overrides?: CallOverrides): Promise<string>;

  "getDomain()"(overrides?: CallOverrides): Promise<string>;

  getGenesisEdition(
    cardId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getGenesisEdition(uint256)"(
    cardId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getRegistry(overrides?: CallOverrides): Promise<string>;

  "getRegistry()"(overrides?: CallOverrides): Promise<string>;

  getRemainingBox(
    phaseId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getRemainingBox(uint256)"(
    phaseId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  issueGenesisCard(
    owner: string,
    id: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "issueGenesisCard(address,uint256)"(
    owner: string,
    id: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  mintBoxes(
    owner: string,
    numberOfBoxes: BigNumberish,
    phaseId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "mintBoxes(address,uint256,uint256)"(
    owner: string,
    numberOfBoxes: BigNumberish,
    phaseId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  openBoxes(
    nftIds: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "openBoxes(bytes)"(
    nftIds: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setRemainingBoxes(
    phaseId: BigNumberish,
    numberOfBoxes: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setRemainingBoxes(uint256,uint256)"(
    phaseId: BigNumberish,
    numberOfBoxes: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  upgradeCard(
    nftId: BigNumberish,
    successTarget: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "upgradeCard(uint256,uint256)"(
    nftId: BigNumberish,
    successTarget: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    batchMigrate(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "batchMigrate(address,bool,bool,bytes)"(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    compute(data: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    "compute(bytes)"(
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    getDomain(overrides?: CallOverrides): Promise<string>;

    "getDomain()"(overrides?: CallOverrides): Promise<string>;

    getGenesisEdition(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getGenesisEdition(uint256)"(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRegistry(overrides?: CallOverrides): Promise<string>;

    "getRegistry()"(overrides?: CallOverrides): Promise<string>;

    getRemainingBox(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getRemainingBox(uint256)"(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    issueGenesisCard(
      owner: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "issueGenesisCard(address,uint256)"(
      owner: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mintBoxes(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "mintBoxes(address,uint256,uint256)"(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    openBoxes(nftIds: BytesLike, overrides?: CallOverrides): Promise<void>;

    "openBoxes(bytes)"(
      nftIds: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    setRemainingBoxes(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "setRemainingBoxes(uint256,uint256)"(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    upgradeCard(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "upgradeCard(uint256,uint256)"(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    CardUpgradeFailed(
      owner: null,
      oldCardId: null
    ): TypedEventFilter<
      [string, BigNumber],
      { owner: string; oldCardId: BigNumber }
    >;

    CardUpgradeSuccessful(
      owner: null,
      oldCardId: null,
      newCardId: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber],
      { owner: string; oldCardId: BigNumber; newCardId: BigNumber }
    >;

    NewGenesisCard(
      owner: string | null,
      carId: BigNumberish | null,
      nftTokenId: BigNumberish | null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber],
      { owner: string; carId: BigNumber; nftTokenId: BigNumber }
    >;

    SetRemainingBoxes(
      phaseId: BigNumberish | null,
      remainingBoxes: BigNumberish | null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      { phaseId: BigNumber; remainingBoxes: BigNumber }
    >;
  };

  estimateGas: {
    batchMigrate(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "batchMigrate(address,bool,bool,bytes)"(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    compute(data: BytesLike, overrides?: Overrides): Promise<BigNumber>;

    "compute(bytes)"(
      data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    getDomain(overrides?: CallOverrides): Promise<BigNumber>;

    "getDomain()"(overrides?: CallOverrides): Promise<BigNumber>;

    getGenesisEdition(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getGenesisEdition(uint256)"(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRegistry(overrides?: CallOverrides): Promise<BigNumber>;

    "getRegistry()"(overrides?: CallOverrides): Promise<BigNumber>;

    getRemainingBox(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getRemainingBox(uint256)"(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    issueGenesisCard(
      owner: string,
      id: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "issueGenesisCard(address,uint256)"(
      owner: string,
      id: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    mintBoxes(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "mintBoxes(address,uint256,uint256)"(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    openBoxes(nftIds: BytesLike, overrides?: Overrides): Promise<BigNumber>;

    "openBoxes(bytes)"(
      nftIds: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setRemainingBoxes(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setRemainingBoxes(uint256,uint256)"(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    upgradeCard(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "upgradeCard(uint256,uint256)"(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    batchMigrate(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "batchMigrate(address,bool,bool,bytes)"(
      owner: string,
      isMint: boolean,
      isBox: boolean,
      nftIdList: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    compute(
      data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "compute(bytes)"(
      data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    getDomain(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getDomain()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getGenesisEdition(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getGenesisEdition(uint256)"(
      cardId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRegistry(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getRegistry()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRemainingBox(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getRemainingBox(uint256)"(
      phaseId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    issueGenesisCard(
      owner: string,
      id: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "issueGenesisCard(address,uint256)"(
      owner: string,
      id: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    mintBoxes(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "mintBoxes(address,uint256,uint256)"(
      owner: string,
      numberOfBoxes: BigNumberish,
      phaseId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    openBoxes(
      nftIds: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "openBoxes(bytes)"(
      nftIds: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setRemainingBoxes(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setRemainingBoxes(uint256,uint256)"(
      phaseId: BigNumberish,
      numberOfBoxes: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    upgradeCard(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "upgradeCard(uint256,uint256)"(
      nftId: BigNumberish,
      successTarget: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
