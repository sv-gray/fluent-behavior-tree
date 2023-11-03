import ResultContainer from "../ResultContainer";
import StateData from "../StateData";

export default interface BehaviorTreeNodeInterface {
    name: string;
    tick(state: StateData): Promise<ResultContainer>;
}
