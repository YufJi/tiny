// import Nerv from 'nerv';
const Nerv = self.Nerv;

const $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;
const $iterate = self.XMLRuntime.iterate;
const $createRoot = self.XMLRuntime.createRoot;
const $createBlock = self.XMLRuntime.createBlock;
const $useTemplate = self.XMLRuntime.useTemplate;
const $createTemplate = self.XMLRuntime.createTemplate;
const $renderSlot = self.XMLRuntime.renderSlot;
const $resolveScopedSlots = self.XMLRuntime.resolveScopedSlots;
const $getSJSMember = self.XMLRuntime.getSJSMember;
const $toString = self.XMLRuntime.toString;
const $getLooseDataMember = self.XMLRuntime.getLooseDataMember;

let $templates = {};
export default function render(data, _ctx) {

return $createRoot(
<tiny-view>
{$toString("include")}
</tiny-view>
);
};