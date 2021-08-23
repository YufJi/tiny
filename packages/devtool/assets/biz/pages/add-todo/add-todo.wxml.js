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
import { $ownTemplates as $ownTemplates1 } from "./a.wxml";
import $render$2 from "./b.wxml";

let $templates = {};
$templates = {
...$ownTemplates1,
};
export default function render(data, _ctx) {



return $createRoot(
<tiny-view 
className = {"page-add-todo"}
>
{
[
$render$2.apply(this, arguments)
,
<tiny-view 
className = {"add-todo"}
>
<tiny-input 
className = {"add-todo-input"} placeholder = {"What needs to be done?"} bindinput = {_ctx.$$eventBinder("onInput")} value = {(data['inputValue'])}
>
</tiny-input>
</tiny-view>
,
<tiny-view 
bindtap = {_ctx.$$eventBinder("add")}
>
{$toString("12121")}
</tiny-view>
,
<tiny-view 
catchtap = {_ctx.$$eventBinder("add")}
>
{$toString("12121")}
</tiny-view>
,
<tiny-view 
className = {"todo-footer"}
>
<AddButton 
text = {"Add Todo"} bindclick_me = {_ctx.$$eventBinder("add")}
>
</AddButton>
</tiny-view>
,
<tiny-view 
style = {"color: red"} capture-catchtap = {_ctx.$$eventBinder("xxxx")}
>
{$toString("capture-catch:tap")}
</tiny-view>
,
$useTemplate($templates["abc"],(({
  inputValue: data['inputValue']
})),undefined,this)
,
]
}
</tiny-view>
);
};