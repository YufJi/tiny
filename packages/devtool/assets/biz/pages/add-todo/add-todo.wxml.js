import Nerv from 'nerv';

const $createReactElement = Nerv && Nerv.createElement;
const $getEventHandler = (instance, name) => instance.$getEventHandler(name);
const $getRefHandler = (instance, name) => instance.$getRefHandler(name);
const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);

const $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;
const { getComponentClass } = self.MP;
const $getComponentClass = (name) => getComponentClass && getComponentClass(name);

const View_ = self.MPUI['view'];
const View = View_ || $EmptyComponentFactory("view");
const Input_ = self.MPUI['input'];
const Input = Input_ || $EmptyComponentFactory("input");
const AddButton_ = $getComponentClass("/components/add-button/add-button")
const AddButton = AddButton_ || $EmptyComponentFactory("add-button");
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
import { $ownTemplates as $ownTemplates1 } from "./a.wxml";
import $render$2 from "./b.wxml";

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
bindtap = {$getEventHandler(this, "add")}
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
text = {"Add Todo"} bindclickme = {$getEventHandler(this, "add")} $isCustomComponent = {this.$isCustomComponent} __tag = "add-button" __owner = {this} __page = {this.$isCustomComponent ? this.props['__page'] : this}
>
</AddButton>
</View>
,
<View 
style = {"color: red"} captureCatchtap = {$getEventHandler(this, "xxxx")}
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