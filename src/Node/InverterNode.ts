import BehaviorTreeStatus from "../BehaviorTreeStatus";
import BehaviorTreeError from "../Error/BehaviorTreeError";
import Errors from "../Error/Errors";
import ResultContainer from "../ResultContainer";
import StateData from "../StateData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Decorator node that inverts the success/failure of its child.
 *
 * @property {string} name - The name of the node
 */
export default class InverterNode implements ParentBehaviorTreeNodeInterface {
    /**
     * The child to be inverted
     */
    private childNode?: BehaviorTreeNodeInterface;

    public constructor(public readonly name: string) {
    }

    public async tick(state: StateData): Promise<ResultContainer> {
        if (!this.childNode) {
            throw new BehaviorTreeError(Errors.INVERTER_NO_CHILDREN);
        }

        const childResult = await this.childNode.tick(state);
        const {status, name} = childResult;
        const myResult: ResultContainer = {
            name: this.name,
            status: BehaviorTreeStatus.Running,
            children: {
                [name]: childResult,
            },
        };

        if (status === BehaviorTreeStatus.Success) {
            myResult.status = BehaviorTreeStatus.Failure;
        } else if (status === BehaviorTreeStatus.Failure) {
            myResult.status = BehaviorTreeStatus.Success;
        }

        return myResult;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        if (!!this.childNode) {
            throw new BehaviorTreeError(Errors.INVERTER_MULTIPLE_CHILDREN);
        }

        this.childNode = child;
    }
}
