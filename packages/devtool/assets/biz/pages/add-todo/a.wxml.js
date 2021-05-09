import Nerv from 'nerv';

const $createReactElement = Nerv && Nerv.createElement;
const $getEventHandler = (instance, name) => instance.$getEventHandler(name);
const $getRefHandler = (instance, name) => instance.$getRefHandler(name);
const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);

const $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;
const View_ = self.MPUI['view'];
const View = View_ || $EmptyComponentFactory("view");
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

let $template;
export const $ownTemplates = {};
$template = $ownTemplates["abc"] = function (data) {
return (
<View>
{$toString("21212")}
</View>
);
};

$template.Component = $createTemplate("abc", $template);

let $templates = {};
$templates = $ownTemplates;
export default function render(data) {
return $createRoot(
null
);
};