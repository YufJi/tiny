import React from 'react';

const $createReactElement = React && React.createElement;
const $getComponentEventHandler = (instance, name) => instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
const $getEventHandler = (instance, name) => instance.$getEventHandler(name);
const $getRefHandler = (instance, name) => instance.$getRefHandler(name);
const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);

const $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
const { getComponentClass } = self.MP;

const $getComponentClass = (name) => getComponentClass && getComponentClass(name);

import View_ from '@hulk/mp-components/view';
const View = View_ || $EmptyComponentFactory("view");
import Input_ from '@hulk/mp-components/input';
const Input = Input_ || $EmptyComponentFactory("input");
const AddButton_ = $getComponentClass("/components/add-button/add-button")
const AddButton = AddButton_ || $EmptyComponentFactory("add-button");
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
import { $ownTemplates as $ownTemplates1 } from "./a.axml";
import $render$2 from "./b.axml";

let $templates = {};
$templates = {
...$ownTemplates1,
};
export default function render(data) {
return $createRoot(
<View 
className = {"page-add-todo"}
>
{
[
$render$2.apply(this, arguments)
,
<View 
className = {"add-todo"}
>
<Input 
className = {"add-todo-input"} placeholder = {"What needs to be done?"} onBlur = {"onBlur"} value = {(data['inputValue'])}
>
</Input>
</View>
,
<View 
ontap = {$getEventHandler(this, "add")}
>
{$toString("12121")}
</View>
,
<View 
catchtap = {$getEventHandler(this, "add")}
>
{$toString("12121")}
</View>
,
<View 
className = {"todo-footer"}
>
<AddButton 
text = {"Add Todo"} ontap = {$getComponentEventHandler(this, "xx")} onclickme = {$getComponentEventHandler(this, "add")} $isCustomComponent = {this.$isCustomComponent} __tag = "add-button"
>
</AddButton>
</View>
,
<View 
style = {"color: red"} catchtapcapture = {$getEventHandler(this, "xxxx")}
>
{$toString("capture-catch:tap")}
</View>
,
$useTemplate($templates["abc"],(({
  inputValue: data['inputValue']
})),undefined,this)
,
]
}
</View>
);
};