import Nerv from 'nerv';

const $createReactElement = Nerv && Nerv.createElement;
const $getEventHandler = (instance, name) => instance.$getEventHandler(name);
const $getRefHandler = (instance, name) => instance.$getRefHandler(name);
const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);

const $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;
const { getComponentClass } = self.MP;
const $getComponentClass = (name) => getComponentClass && getComponentClass(name);

const Button_ = self.MPUI['button'];
const Button = Button_ || $EmptyComponentFactory("button");
const Text_ = self.MPUI['text'];
const Text = Text_ || $EmptyComponentFactory("text");
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
export default function render(data) {
return $createRoot(
[
<Button 
className = {"add-button"} hoverClass = {"none"} bindtap = {$getEventHandler(this, "onClickMe")}
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
,
<Text 
bindtap = {$getEventHandler(this, "xx")}
>
{$toString((data['name']))}
</Text>
,
]
);
};