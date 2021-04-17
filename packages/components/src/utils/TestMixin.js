import { getStartupParams } from '@/core/utils/startupParams';

let id = 0;
let isTest;
const empty = {};
function isTesting() {
  if (isTest !== undefined) {
    return isTest;
  }
  isTest = getStartupParams().runStage === 'test';
  return isTest;
}
export default ({
  getTestProps: function getTestProps() {
    if (isTesting()) {
      let testProps = {};
      const props = this.props || {};
      this.dataTestId = this.dataTestId || ++id;
      testProps = {
        'data-testid': this.dataTestId,
      };
      if (props.onTap || props.catchTap) {
        testProps['data-is-bind-on-tap'] = true;
      }
      return testProps;
    } else {
      return empty;
    }
  },
  logTestId: function logTestId() {
    if (isTesting()) {
      const testProps = this.getTestProps();
      console.log(`[data-testid]=${testProps['data-testid']} response`);
    }
  },
});
