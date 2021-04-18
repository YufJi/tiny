import React from 'react';

const $createReactElement = React && React.createElement;
const $getComponentEventHandler = (instance, name) => instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
const $getEventHandler = (instance, name) => instance.$getEventHandler(name);
const $getRefHandler = (instance, name) => instance.$getRefHandler(name);
const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);

const $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
import View_ from '@hulk/mp-components/view';
const View = View_ || $EmptyComponentFactory("view");
const $iterate = self.RMLRuntime.iterate;
const $createRoot = self.RMLRuntime.createRoot;
const $createBlock = self.RMLRuntime.createBlock;
const $useTemplate = self.RMLRuntime.useTemplate;
const $createTemplate = self.RMLRuntime.createTemplate;
const $renderSlot = self.RMLRuntime.renderSlot;
const $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
const $getSJSMember = self.RMLRuntime.getSJSMember;
const $toString = self.RMLRuntime.toString;
const $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

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