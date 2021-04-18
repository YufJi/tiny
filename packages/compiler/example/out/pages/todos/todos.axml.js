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
import Image_ from '@hulk/mp-components/image';
const Image = Image_ || $EmptyComponentFactory("image");
import CheckboxGroup_ from '@hulk/mp-components/checkbox-group';
const CheckboxGroup = CheckboxGroup_ || $EmptyComponentFactory("checkbox-group");
import Label_ from '@hulk/mp-components/label';
const Label = Label_ || $EmptyComponentFactory("label");
import Checkbox_ from '@hulk/mp-components/checkbox';
const Checkbox = Checkbox_ || $EmptyComponentFactory("checkbox");
import Text_ from '@hulk/mp-components/text';
const Text = Text_ || $EmptyComponentFactory("text");
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

let $templates = {};
export default function render(data) {
return $createRoot(
<View 
className = {"page-todos"}
>
{
[
<View 
className = {"user"}
>
{
[
<Image 
className = {"avatar"} src = {($getLooseDataMember([data['user'], "avatar"]) || '../../assets/logo.png')} backgroundSize = {"cover"}
>
</Image>
,
<View 
className = {"nickname"}
>
{[$toString(($getLooseDataMember([data['user'], "nickName"]) && $getLooseDataMember([data['user'], "nickName"]) + '\'s' || 'mp')), $toString(" Todo List")]}
</View>
,
<View 
className = {"test"}
>
{$toString("Todo List")}
</View>
,
]
}
</View>
,
<View 
className = {"todo-items"}
>
<CheckboxGroup 
className = {"todo-items-group"} onChange = {"onTodoChanged"}
>
{
$iterate((data['todos']), (item, index) => {
return (
<Label 
key = {item} className = {"todo-item " + ($getLooseDataMember([item, "completed"]) ? 'checked' : '')}
>
{
[
<Checkbox 
className = {"todo-item-checkbox"} value = {($getLooseDataMember([item, "text"]))} checked = {($getLooseDataMember([item, "completed"]))}
>
</Checkbox>
,
<Text 
className = {"todo-item-text"}
>
{$toString(($getLooseDataMember([item, "text"])))}
</Text>
,
]
}
</Label>
);
})
}
</CheckboxGroup>
</View>
,
<View 
className = {"todo-footer"}
>
<AddButton 
text = {"Add Todo"} onClickMe = {"addTodo"} $isCustomComponent = {this.$isCustomComponent} __tag = "add-button"
>
</AddButton>
</View>
,
]
}
</View>
);
};