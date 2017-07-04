<template>
  <div id="policy">
    <div class="query-header">
      <div class="h-left">共 <span>{{num}}</span> 单</div>
      <div class="h-right" @click="openShaixuan()">筛选</div>
    </div>
    <div class="policy-content martp-0" v-for="obj in policyList">
      <!--保单内容-->
      <div class="p-header white clear">
        <div class="p-num clear" v-bind:div="obj.contNo"><img src="../../../common/img/huifang/dingdan.png" alt="">保单号：{{obj.contNo}}</div>
        <span class="status">{{obj.state}}</span>
      </div>
      <a href="javascript:void(0)" class="turn-detail clear white" v-on:click="openMenu()">
        <p><span>险种名称：</span>{{obj.mainRiskName}}</p>
        <p><span>被保险人：</span>{{obj.appntName}}</p>
        <p><span>下次缴费：</span><i>{{obj.nextFeeAmount}}元</i></p>
        <p><span>缴费日期：</span>{{obj.payToDate}}</p>
      </a>
    </div>

    <!--保单添加 -->
    <div class="add-wrap">
      <div v-html="htmls"></div>
    </div>
    <div class="policy-mask" v-show="showMask">
      <!--筛选-->
      <div class="screen white" v-show="showUl">
             <ul class="screen-list">
               <li v-for="(item,index) in policy" @click="chiocePolicy(index)" v-model="index">{{item.text}}</li>

             </ul>
      </div>
      <!--保单查询-->
      <div class="policy-wrap white" v-show="showList">
         <ul class=" query-list">
           <li>
             <router-link to="query_detail" class="links" @click="uploadCode()">
             <img src="../../../common/img/query/jiben.png" alt="">
             <p class="text-center">基本信息查询</p>
             </router-link>
           </li>
           <li>
             <router-link to="query_hongli" class="links" @click="uploadCode()">
             <img src="../../../common/img/query/jiben.png" alt="">
             <p class="text-center">红利查询</p>
             </router-link>
           </li>
           <li>
             <router-link to="query_wanneng" class="links" @click="uploadCode()">
             <img src="../../../common/img/query/jiben.png" alt="">
             <p class="text-center">万能账户查询</p>
             </router-link>
           </li>
           <li>
             <router-link to="query_shengcun" class="links" @click="uploadCode()">
             <img src="../../../common/img/query/jiben.png" alt="">
             <p class="text-center">生存金查询</p>
             </router-link>
           </li>
         </ul>
        <a href="" class="next query-close">关闭</a>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'app',
    data(){
        return{
          showMask:false,
          showUl:false,
          showList:false,
          policy:[{text:'有效保单'}, {text:'停效保单'}, {text:'终止保单'}],
          index:0,
          policyList:[],
          policyNum:'',
          num:'',
          htmls:''
        }
    },
    methods:{
        //点击筛选按钮
        openShaixuan: function(){
          this.showUl = !this.showUl;
          this.showMask = !this.showMask;
        },

   //点击保单区域
      openMenu: function(){
        this.showMask = !this.showMask;
        this.showList = !this.showList;
      },

     //选择有效、停效、终止保单
      chiocePolicy: function (val) {

        //显示隐藏
        var that =this;
        that.showMask=!that.showMask;
        that.showUl = !that.showUl;

      //传入ul中li的val值
        var code='0'+(val+2).toString();
        console.log(code);
        this.getPolicy(code);
      },
//      公共调用数据方法
      getPolicy:function (val) {


      },

      uploadCode:function (event) {

          return localStorage.setItem('code','010001549257008');

      }

    },
    mounted:function(){
      this.getPolicy('01');
      this.uploadCode();
    }


  }
</script>

<style scoped>
  @import "../../../common/css/general.css";
  @import "../../../common/css/index.css";
  @import "../../../common/css/wevisit.css";
  @import "../../../common/css/question.css";
  @import "../../../common/css/query.css";

</style>
