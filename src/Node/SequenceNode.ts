import BehaviorTreeStatus from "../BehaviorTreeStatus";
import NodeEnumerator from "../NodeEnumerator";
import ResultContainer from "../ResultContainer";
import StateData from "../StateData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Runs child nodes in sequence, until one fails.
 *
 * @property {string} name - The name of the node.
 */
export default class SequenceNode implements ParentBehaviorTreeNodeInterface {
    /**
     * List of child nodes.
     *
     * @type {BehaviorTreeNodeInterface[]}
     */
    private children: BehaviorTreeNodeInterface[] = [];

    /**
     * Enumerator to keep state
     */
    private enumerator?: NodeEnumerator;

    private ownResult?: ResultContainer;

    public constructor(public readonly name: string, private readonly keepState: boolean = false) {
    }

    public init(): void {
        this.enumerator = new NodeEnumerator(this.children);
    }

    public async tick(state: StateData): Promise<ResultContainer> {
        if (!this.enumerator || !this.keepState) {
            this.init();
        }

        if (!this.ownResult) {
            this.ownResult = {
                name: this.name,
                status: BehaviorTreeStatus.Running,
                children: {},
            };
        }

        if (!this.enumerator.current) {
            this.ownResult.status = BehaviorTreeStatus.Running;
            return this.ownResult;
        }

        do {
            const childResult = await this.enumerator.current.tick(state);
            const {status, name} = childResult;
            this.ownResult.children[name] = childResult;

            if (status !== BehaviorTreeStatus.Success) {
                if (status === BehaviorTreeStatus.Failure) {
                    this.enumerator.reset();
                }

                this.ownResult.status = status;
                return this.ownResult;
            }

        } while (this.enumerator.next());
        this.enumerator.reset();

        this.ownResult.status = BehaviorTreeStatus.Success;
        return this.ownResult;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        this.children.push(child);
    }
}
