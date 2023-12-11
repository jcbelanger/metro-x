import './Score.scss';
import React, { useId } from 'react';
import classNames from 'classnames';


export type ScoreProps = {
    completed: number,
    transfers: number,
    empty: number
};

export const Score:React.FC<ScoreProps> = ({completed, transfers, empty}) => {
    const pathId = useId();

    const styles = {
        radius: 20,
        gap: 15,
        padding: 10
    };

    const circleSize = 2 * styles.radius;
    const width = 4 * circleSize + 3 * styles.gap + 2 * styles.padding;
    const height = circleSize + 2 * styles.padding;

    const emptyPenaltyThreshs = [4, 5, 6, 7, 9, 11, 13, 15, 17, 19];
    const threshIx = emptyPenaltyThreshs.findIndex(thresh => empty <= thresh);
    const emptyPenalty = threshIx < 0 ? emptyPenaltyThreshs.length : threshIx;

    const circleTexts = {
        completed,
        transfers,
        empty: emptyPenalty,
        total: completed + transfers - emptyPenalty
    };
    type circleTypes = 'completed' | 'transfers' | 'empty' | 'total';
    const circles:circleTypes[] = ['completed', 'transfers', 'empty', 'total'];
    
    return <>
        <svg 
            className='score'
            version='1.1'
            baseProfile='full'
            viewBox={`0 0 ${width} ${height}`} 
            xmlns='http://www.w3.org/2000/svg'
        >
            <defs>
                <path 
                    id={pathId} 
                    d={`
                        M 0 ${styles.radius} 
                        a ${styles.radius} ${styles.radius} 0 0 1 0 ${-2 * styles.radius}
                        a ${styles.radius} ${styles.radius} 0 0 1 0 ${2 * styles.radius}
                    `}
                />
            </defs>
            {circles.map((circle, ix) => {
                const cx = circleSize / 2 + ix * (circleSize + styles.gap);
                const cy = circleSize / 2;
                const circleValue = circleTexts[circle]
                return <g key={circle} className='score-circle'>
                    <title>{`${circle[0].toLocaleUpperCase() + circle.substring(1)}: ${circleValue}`}</title>
                    <circle 
                        className='circle-bg'
                        cx={cx}
                        cy={cy}
                        r={styles.radius}
                    >
                    </circle>
                    <text 
                        className='circle-label'
                        transform={`translate(${cx}, ${cy})`}
                        fontSize={styles.radius / 5}
                        dy='0.5em'
                    ><textPath href={`#${pathId}`} startOffset='50%'>{circle}</textPath></text>
                    <text
                        className='circle-value'
                        x={cx}
                        y={cy}
                        fontSize={styles.radius}
                    >{circleValue}</text>
                </g>
            })}

            {['+', '−', '='].map((operator, ix) => 
                <text 
                    key={ix}
                    className='score-operator'
                    x={(ix + 1) * (circleSize + styles.gap) - styles.gap/2}
                    y={circleSize / 2}
                    textAnchor='middle'
                    dominantBaseline='central'
                    fontSize={styles.gap}
                >{operator}</text>
            )}
        </svg>
        
        <table className='penalty-table'>
            <thead>
                <tr>
                    <th>Empty Stations</th>
                    <th>Penalty</th>
                </tr>
            </thead>
            <tbody>
                <tr className={classNames({'active': threshIx === 0})}>
                    <td>0&ndash;{emptyPenaltyThreshs[0]}</td>
                    <td>0</td>
                </tr>
                {emptyPenaltyThreshs.slice(1).map((thresh, ix) => {
                    const prev = emptyPenaltyThreshs[ix];
                    return <tr key={ix} className={classNames({'active': threshIx === ix + 1})}>
                        <td>{thresh - prev === 1 ? thresh : `${prev + 1}–${thresh}`}</td>
                        <td>{-(ix + 1)}</td>
                    </tr>
                })}
                <tr className={classNames({'active': threshIx < 0})}>
                    <td>{emptyPenaltyThreshs[emptyPenaltyThreshs.length - 1] + 1}+</td>
                    <td>{-emptyPenaltyThreshs.length}</td>
                </tr>
            </tbody>
        </table>
    </>;
};

export default Score;