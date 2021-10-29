
export class SortTreeNode<T> {
    __degree = 0;
    __dependants: SortTreeNode<T>[] = [];
    constructor(public value: T, public deps: SortTreeNode<T>[] = []) {
        this.__degree = deps.length;
        deps.forEach(dep => dep.__dependants.push(this));
    }
}

export class CycleDepsError extends Error {}

export function topologicalGroupedSort<T>(nodes: SortTreeNode<T>[]): Array<SortTreeNode<T>[]> {
    if (!nodes.length) return [];

    let round: SortTreeNode<T>[] = [...nodes];
    let nextRound: SortTreeNode<T>[] = [];
    const sorted: Array<SortTreeNode<T>[]> = [];
    let roundIndex = 0;

    while (nextRound.length || round.length) {
        const roundSorted = [];

        while (round.length) {
            const node = round.shift();
            if (node.__degree > 0) {
                nextRound.push(node);
                continue;
            }

            roundSorted.push(node);
        }

        if (!roundSorted.length) {
            throw new CycleDepsError();
        }

        roundSorted.forEach(node => {
            node.__dependants.forEach(dependant => dependant.__degree--);
        })

        sorted[roundIndex] = roundSorted;
        round = nextRound;
        nextRound = [];
        roundIndex++;
    }

    return sorted;
}
