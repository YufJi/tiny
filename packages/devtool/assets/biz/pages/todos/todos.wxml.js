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

let $templates = {};
export default function render(data, _ctx) {













return $createRoot(
<tiny-scroll-view 
className = {"page-todos"} scroll-y = {"true"}
>
{
[
<tiny-view 
id = {"parent"} style = {"background: green;"} capture-bindtap = {_ctx.$$eventBinder("pct")} bindtap = {_ctx.$$eventBinder("pt")} bindlongpress = {_ctx.$$eventBinder("plp")} bindtouchstart = {_ctx.$$eventBinder("pts")} bindtouchmove = {_ctx.$$eventBinder("ptm")}
>
<tiny-view 
capture-bindtap = {_ctx.$$eventBinder("cct")} catchtap = {_ctx.$$eventBinder("ct")} bindtouchstart = {_ctx.$$eventBinder("cts")} catchtouchmove = {_ctx.$$eventBinder("ctm")}
>
{$toString("longpress/tap component")}
</tiny-view>
</tiny-view>
,
<tiny-view 
className = {"user"}
>
{
[
<tiny-image 
className = {"avatar"} src = {($getLooseDataMember([data['user'], "avatar"]) || '../../assets/logo.png')} background-size = {"cover"}
>
</tiny-image>
,
<tiny-view 
className = {"nickname"}
>
{[$toString(($getLooseDataMember([data['user'], "nickName"]) && $getLooseDataMember([data['user'], "nickName"]) + '\'s' || 'mp')), $toString(" Todo List")]}
</tiny-view>
,
<tiny-view 
className = {"test"}
>
{$toString("Todo List")}
</tiny-view>
,
]
}
</tiny-view>
,
<tiny-view 
className = {"todo-items"}
>
<tiny-checkbox-group 
className = {"todo-items-group"} bindchange = {_ctx.$$eventBinder("onTodoChanged")}
>
{
$iterate((data['todos']), (item, index) => {
return (
<tiny-label 
key = {item} bindtap = {_ctx.$$eventBinder("clicklabel")} className = {"todo-item " + ($getLooseDataMember([item, "completed"]) ? 'checked' : '')}
>
{
[
<tiny-checkbox 
className = {"todo-item-checkbox"} value = {($getLooseDataMember([item, "text"]))} checked = {($getLooseDataMember([item, "completed"]))}
>
</tiny-checkbox>
,
<tiny-text 
className = {"todo-item-text"}
>
{$toString(($getLooseDataMember([item, "text"])))}
</tiny-text>
,
]
}
</tiny-label>
);
})
}
</tiny-checkbox-group>
</tiny-view>
,
<tiny-slider 
bindchange = {_ctx.$$eventBinder("sliderChange")} show-value = {(true)}
>
</tiny-slider>
,
<tiny-view 
className = {"progress-box"}
>
<tiny-progress 
percent = {"20"} show-info active stroke-width = {"3"}
>
</tiny-progress>
</tiny-view>
,
<tiny-view 
className = {"section section_gap"}
>
{
[
<tiny-view 
className = {"section__title"}
>
{$toString("type=\"switch\"")}
</tiny-view>
,
<tiny-view 
className = {"body-view"}
>
<tiny-switch 
checked = {(data['switchChecked'])} bindchange = {_ctx.$$eventBinder("switchChange")}
>
</tiny-switch>
</tiny-view>
,
]
}
</tiny-view>
,
<tiny-view 
className = {"todo-footer"}
>
{
[
<AddButton 
id = {"asd"} text = {(data['text'])} bindclick_me = {_ctx.$$eventBinder("clickCom")}
>
<tiny-text 
bindtap = {_ctx.$$eventBinder("tapSlot")}
>
{$toString("i am slot")}
</tiny-text>
</AddButton>
,
(
((data['text'] === 'def')) ?
(
<AddButton 
id = {"asxx"} xx = {"xxx"} text = {(data['text'])} bindclick_me = {_ctx.$$eventBinder((data['fn']))}
>
</AddButton>
)
:
null
)
,
]
}
</tiny-view>
,
<tiny-view 
bindtap = {_ctx.$$eventBinder("clickParent")}
>
{
[
<tiny-view 
className = {"jyf"} capture-bindtap = {_ctx.$$eventBinder("captureClickChild")} style = {"background: yellow;"}
>
{$toString("capture child")}
</tiny-view>
,
<tiny-view 
data-xhq = {"jyf"} bindlongpress = {_ctx.$$eventBinder("clickChild")} style = {"margin-top: 120rpx; background: red;"}
>
{$toString((data['haha']))}
</tiny-view>
,
]
}
</tiny-view>
,
<tiny-view 
className = {"container"}
>
<tiny-view 
className = {"page-body"}
>
{
[
<tiny-view 
className = {"page-section page-section-spacing swiper"}
>
<tiny-swiper 
indicator-dots = {(data['indicatorDots'])} autoplay = {(data['autoplay'])} interval = {(data['interval'])} duration = {(data['duration'])} circular = {(true)}
>
{
$iterate((data['background']), (item, index) => {
return (
(
<tiny-swiper-item>
<tiny-view 
className = {"swiper-item " + (item)}
>
</tiny-view>
</tiny-swiper-item>
)
);
})
}
</tiny-swiper>
</tiny-view>
,
<tiny-view 
className = {"page-section"} style = {"margin-top: 20px;margin-bottom: 0;"}
>
<tiny-view 
className = {"weui-cells weui-cells_after-title"}
>
{
[
<tiny-view 
className = {"weui-cell weui-cell_switch"}
>
{
[
<tiny-view 
className = {"weui-cell__bd"}
>
{$toString("指示点")}
</tiny-view>
,
<tiny-view 
className = {"weui-cell__ft"}
>
<tiny-switch 
checked = {(data['indicatorDots'])} bindchange = {_ctx.$$eventBinder("changeIndicatorDots")}
>
</tiny-switch>
</tiny-view>
,
]
}
</tiny-view>
,
<tiny-view 
className = {"weui-cell weui-cell_switch"}
>
{
[
<tiny-view 
className = {"weui-cell__bd"}
>
{$toString("自动播放")}
</tiny-view>
,
<tiny-view 
className = {"weui-cell__ft"}
>
<tiny-switch 
checked = {(data['autoplay'])} bindchange = {_ctx.$$eventBinder("changeAutoplay")}
>
</tiny-switch>
</tiny-view>
,
]
}
</tiny-view>
,
]
}
</tiny-view>
</tiny-view>
,
<tiny-view 
className = {"page-section page-section-spacing"}
>
{
[
<tiny-view 
className = {"page-section-title"}
>
{
[
<tiny-text>
{$toString("幻灯片切换时长(ms)")}
</tiny-text>
,
<tiny-text 
className = {"info"}
>
{$toString((data['duration']))}
</tiny-text>
,
]
}
</tiny-view>
,
<tiny-slider 
bindchange = {_ctx.$$eventBinder("durationChange")} value = {(data['duration'])} min = {"500"} max = {"2000"}
>
</tiny-slider>
,
<tiny-view 
className = {"page-section-title"}
>
{
[
<tiny-text>
{$toString("自动播放间隔时长(ms)")}
</tiny-text>
,
<tiny-text 
className = {"info"}
>
{$toString((data['interval']))}
</tiny-text>
,
]
}
</tiny-view>
,
<tiny-slider 
bindchange = {_ctx.$$eventBinder("intervalChange")} value = {(data['interval'])} min = {"3000"} max = {"10000"}
>
</tiny-slider>
,
]
}
</tiny-view>
,
]
}
</tiny-view>
</tiny-view>
,
<tiny-view 
bindtap = {_ctx.$$eventBinder("showToast")}
>
{$toString("showToast")}
</tiny-view>
,
]
}
</tiny-scroll-view>
);
};