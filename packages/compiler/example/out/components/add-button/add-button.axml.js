import React from 'react';

const $createReactElement = React && React.createElement;
const $getComponentEventHandler = (instance, name) => instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
const $getEventHandler = (instance, name) => instance.$getEventHandler(name);
const $getRefHandler = (instance, name) => instance.$getRefHandler(name);
const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);

const $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
const { getComponentClass } = self.MP;

const $getComponentClass = (name) => getComponentClass && getComponentClass(name);

import Button_ from '@hulk/mp-components/button';
const Button = Button_ || $EmptyComponentFactory("button");
import Text_ from '@hulk/mp-components/text';
const Text = Text_ || $EmptyComponentFactory("text");
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

let $templates = {};
export default function render(data) {
return $createRoot(
<Button 
className = {"add-button"} hoverClass = {"none"} onTap = {"onClickMe"}
>
{
[
<Text 
className = {"add-icon"}
>
{$toString("+")}
</Text>
,
<Text>
{$toString((data['text']))}
</Text>
,
]
}
</Button>
);
};