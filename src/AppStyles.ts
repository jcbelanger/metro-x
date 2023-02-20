import React from 'react';
import { Record, RecordOf } from 'immutable';


export type StationStyleProps = {
    radius: number,
    strokeWidth: number
};

export const makeStationStyles:Record.Factory<StationStyleProps> = Record<StationStyleProps>({
    radius: 15,
    strokeWidth: 4
});

export type StationStyle = RecordOf<StationStyleProps>;

export type RouteStyleProps = {
    strokeWidth: number,
    edgeGap: number
};

export const makeRouteStyles = Record<RouteStyleProps>({
    strokeWidth: 8,
    edgeGap: 2
});

export type RouteStyles = RecordOf<RouteStyleProps>;

export type RouteNameStyleProps = {
    radius: number
};

export const makeRouteNameStyles = Record<RouteNameStyleProps>({
    radius: 20
});

export type RouteNameStyles = RecordOf<RouteNameStyleProps>;

export type IntialCompletionBonusStyleProps = {
    width: number,
    height: number,
    strokeWidth: number,
    dx: number,
    dy: number
};

export const makeInitialCompletionStyles = Record<IntialCompletionBonusStyleProps>({
    width: 24,
    height: 30,
    strokeWidth: 1,
    dx: -8,
    dy: -5
});

export type InitialCompletionStyles = RecordOf<IntialCompletionBonusStyleProps>;

export type SubsequentCompletionBonusStyleProps = {
    width: number,
    height: number,
    strokeWidth: number,
    dx: number,
    dy: number
};

export const makeSubsequentCompletionBonusStyles = Record<SubsequentCompletionBonusStyleProps>({
    width: 18,
    height: 20,
    strokeWidth: 2,
    dx: 5,
    dy: 8
});

export type SubsequentCompletionBonusStyles = RecordOf<SubsequentCompletionBonusStyleProps>;

export type CompletionBonusStyleProps = {
    initial: InitialCompletionStyles,
    subsequent: SubsequentCompletionBonusStyles
};

export const makeCompletionBonusStyles = Record<CompletionBonusStyleProps>({
    initial: makeInitialCompletionStyles(),
    subsequent: makeSubsequentCompletionBonusStyles()
});

export type CompletionBonusStyles = RecordOf<CompletionBonusStyleProps>;

export type TrainCarFrontStyleProps = {
    cornerX: number,
    cornerY: number,
    width: number,
    lightRadius: number
};

export const makeTrainCarFrontStyles = Record<TrainCarFrontStyleProps>({
    cornerX: 8,
    cornerY: 15,
    width: 8,
    lightRadius: 2.5
});

export type TrainCarFrontStyles = RecordOf<TrainCarFrontStyleProps>;

export type TrainCarWindowStyleProps = {
    gap: number,
    width: number,
    height: number,
    border: number
};

export const makeTrainCarWindowStyles = Record<TrainCarWindowStyleProps>({
    gap: 8,
    width: 27,
    height: 27,
    border: 2
});

export type TrainCarWindowStyles = RecordOf<TrainCarWindowStyleProps>;

export type TrainCarWheelStyleProps = {
    margin: number,
    radius: number
};

export const makeTrainCarWheelStyles = Record<TrainCarWheelStyleProps>({
    margin: 7,
    radius: 8
});

export type TrainCarWheelStyles = RecordOf<TrainCarWheelStyleProps>;

export type TrainCarUnderTrackStyleProps = {
    enabled: boolean,
    strokeWidth: number,
    margin: number,
    dashes: number
};

export const makeTrainCarUnderTrackStyles = Record<TrainCarUnderTrackStyleProps>({
    enabled: true,
    strokeWidth: 4,
    margin: 2,
    dashes: 1
});

export type TrainCarUnderTrackStyles = RecordOf<TrainCarUnderTrackStyleProps>;

export type TrainCarStyleProps = {
    paddingX: number,
    paddingY: number,
    front: TrainCarFrontStyles,
    window: TrainCarWindowStyles
    wheels: TrainCarWheelStyles,
    underTrack: TrainCarUnderTrackStyles
};

export const makeTrainCarStyles = Record<TrainCarStyleProps>({
    paddingX: 9,
    paddingY: 6,
    front: makeTrainCarFrontStyles(),
    window: makeTrainCarWindowStyles(),
    wheels: makeTrainCarWheelStyles(),
    underTrack: makeTrainCarUnderTrackStyles()
});

export type TrainCarStyles = RecordOf<TrainCarStyleProps>;

export type AppStyleProps = {
    spacing: number,
    station: StationStyle,
    route: RouteStyles,
    routeName: RouteNameStyles,
    completionBonus: CompletionBonusStyles,
    trainCar: TrainCarStyles
};

export const makeAppStyles:Record.Factory<AppStyleProps> = Record<AppStyleProps>({
    spacing: 50,
    station: makeStationStyles(),
    route: makeRouteStyles(),
    routeName: makeRouteNameStyles(),
    completionBonus: makeCompletionBonusStyles(),
    trainCar: makeTrainCarStyles()
});

export type AppStyles = RecordOf<AppStyleProps>;

export const AppStylesContext = React.createContext(makeAppStyles())