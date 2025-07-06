import { FileStatus } from 'src/common/enums/file-status';
import { Transition } from '../Istatemachine';
import { FileStatusEvent } from './resume.state-machine.events';
import { Resume } from 'src/common/entities/resume.entity';
import { FileStateHandlers } from './resume.state-machine.handlers';

export const fileTransitions: Transition<
  FileStatus,
  FileStatusEvent,
  Resume
>[] = [
  {
    fromState: FileStatus.NEW,
    toState: FileStatus.PENDING,
    stateMachineEvent: FileStatusEvent.SET_PENDING,
    handlers: [FileStateHandlers.setStatusHandler],
  },
  {
    fromState: FileStatus.PENDING,
    toState: FileStatus.PROCESSED,
    stateMachineEvent: FileStatusEvent.SET_PROCESSED,
    handlers: [FileStateHandlers.setStatusHandler],
  },
  {
    fromState: FileStatus.PENDING,
    toState: FileStatus.INVALID,
    stateMachineEvent: FileStatusEvent.SET_INVALID,
    handlers: [FileStateHandlers.setStatusHandler],
  },
  {
    fromState: FileStatus.NEW,
    toState: FileStatus.INVALID,
    stateMachineEvent: FileStatusEvent.SET_INVALID,
    handlers: [FileStateHandlers.setStatusHandler],
  },
];
