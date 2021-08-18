import { subscribe } from '../bridge';
import invokeUserMethod from './invokeUserMethod';

export default function loadPageEvent() {
  subscribe('PAGE_EVENT', invokeUserMethod);
}
