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
const Image_ = self.MPUI['image'];
const Image = Image_ || $EmptyComponentFactory("image");
const CheckboxGroup_ = self.MPUI['checkbox-group'];
const CheckboxGroup = CheckboxGroup_ || $EmptyComponentFactory("checkbox-group");
const Label_ = self.MPUI['label'];
const Label = Label_ || $EmptyComponentFactory("label");
const Checkbox_ = self.MPUI['checkbox'];
const Checkbox = Checkbox_ || $EmptyComponentFactory("checkbox");
const Text_ = self.MPUI['text'];
const Text = Text_ || $EmptyComponentFactory("text");
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
className = {"todo-items-group"} bindchange = {$getEventHandler(this, "onTodoChanged")}
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
<View>
{$toString((data['text']))}
</View>
,
<View 
className = {"todo-footer"}
>
{
[
<AddButton 
text = {(data['text'])} bindclick_me = {$getEventHandler(this, "clickCom")} $isCustomComponent = {this.$isCustomComponent} __tag = "add-button" __owner = {this} __page = {this.$isCustomComponent ? this.props['__page'] : this}
>
</AddButton>
,
<AddButton 
xx = {"xxx"} text = {(data['text'])} bindclick_me = {$getEventHandler(this, (data['fn']))} $isCustomComponent = {this.$isCustomComponent} __tag = "add-button" __owner = {this} __page = {this.$isCustomComponent ? this.props['__page'] : this}
>
</AddButton>
,
]
}
</View>
,
<View 
bindtap = {$getEventHandler(this, "clickParent")}
>
{
[
<View 
className = {"jyf"} captureBindtap = {$getEventHandler(this, "captureClickChild")} style = {"background: yellow;"}
>
{$toString("capture child")}
</View>
,
<View 
bindtap = {$getEventHandler(this, "clickChild")} style = {"margin-top: 120rpx; background: red;"}
>
{$toString("child")}
</View>
,
]
}
</View>
,
]
}
</View>
);
};