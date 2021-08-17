import Nerv from 'nerv';

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

let $template;
export const $ownTemplates = {};
$template = $ownTemplates["abc"] = function (data) {
return (
<tiny-view>
{$toString("21212")}
</tiny-view>
);
};

$template.Component = $createTemplate("abc", $template);

let $templates = {};
$templates = $ownTemplates;
export default function render(data, _ctx) {

return $createRoot(
null
);
};