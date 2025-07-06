import { FileStatus } from '../../../common/enums/file-status';
import { StateMachineEventHandler } from '../Istatemachine';
import { FileStatusEvent } from './resume.state-machine.events';
import { Resume } from '../../../common/entities/resume.entity';

export type FileStateHandler = StateMachineEventHandler<
  FileStatus,
  FileStatusEvent,
  Resume
>;

export class FileStateHandlers {
  public static setStatusHandler: FileStateHandler = (
    fromState,
    toState,
    event,
    entity,
  ) => {
    if (entity) {
      entity.status = toState;
    } else {
      throw new Error(
        `State machine handler for event '${event}' frpm '${fromState}' to '${toState}' was called without an entity.`,
      );
    }
  };
}
