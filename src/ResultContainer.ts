/**
 * Represents the state of the behavior tree.
 *
 * @property {string} name - The name of the node.
 * @property {BehaviorTreeStatus} status     - The current status of this node.
 * @property {object} children     - (Optional) results of any child nodes of this node.
 */

import BehaviorTreeStatus from "./BehaviorTreeStatus";

interface ResultContainer {
    name: string;
    status: BehaviorTreeStatus;
    children?: {
        [key: string]: ResultContainer;
    };
}
export default ResultContainer;
