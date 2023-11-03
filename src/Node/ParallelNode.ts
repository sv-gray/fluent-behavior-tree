import BehaviorTreeStatus from "../BehaviorTreeStatus";
import ResultContainer from "../ResultContainer";
import StateData from "../StateData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Runs child's nodes in parallel.
 *
 * @property {string} name                 - The name of the node.
 * @property {number} requiredToFail    - Number of child failures required to terminate with failure.
 * @property {number} requiredToSucceed - Number of child successes required to terminate with success.
 */
export default class ParallelNode implements ParentBehaviorTreeNodeInterface {
    /**
     * List of child nodes.
     *
     * @type {BehaviorTreeNodeInterface[]}
     */
    private children: BehaviorTreeNodeInterface[] = [];

    public constructor(
        public readonly name: string,
        public readonly requiredToFail: number,
        public readonly requiredToSucceed: number,
    ) {
    }

    public async tick(state: StateData): Promise<ResultContainer> {
        const childResults: ResultContainer[] =
            await Promise.all(this.children.map((c) => this.tickChildren(state, c)));
        const succeeded =
            childResults.filter(({status}) => status === BehaviorTreeStatus.Success).length;
        const failed =
            childResults.filter(({status}) => status === BehaviorTreeStatus.Failure).length;

        const myResult: ResultContainer = {
            name: this.name,
            status: BehaviorTreeStatus.Running,
            children: {},
        };

        childResults.forEach((result) => myResult.children[result.name] = result);

        if (this.requiredToSucceed > 0 && succeeded >= this.requiredToSucceed) {
            myResult.status = BehaviorTreeStatus.Success;
        }
        if (this.requiredToFail > 0 && failed >= this.requiredToFail) {
            myResult.status = BehaviorTreeStatus.Failure;
        }

        return myResult;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        this.children.push(child);
    }

    private async tickChildren(state: StateData, child: BehaviorTreeNodeInterface): Promise<ResultContainer> {
        try {
            return await child.tick(state);
        } catch (e) {
            return {
                name: child.name,
                status: BehaviorTreeStatus.Failure,
            };
        }
    }
}
