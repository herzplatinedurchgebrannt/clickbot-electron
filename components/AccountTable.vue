<template>
  <button v-on:click="startDriver">Connect</button>
  <div class="table">

  </div>
<keep-alive>
  <div v-for="account in accounts" :key="account.message">
    <AccountSingle :artist=account.currentBand :song=account.currentTitle 
                   :email=account.email :state=account.state :imgSrc=account.currentImage 
                   :playedSongs=account.logPlayedSongs   />
                   
  </div>
  </keep-alive>
</template>

<script>

import AccountSingle from '@/components/AccountSingle.vue'

export default {
  name: 'AccountTable',
  props: {
  },
  components: {
    AccountSingle
  },
  data: function () {
    return {

      linki: "https://www.impuls-medien.org/wp-content/uploads/2016/04/dummy-post-square-1-2.jpg",
      time: null,
      accounts: [],
    }
  },
  
  mounted() {
    // handle reply from the backend
    window.ipc.on('START_DRIVER', (payload) => {
      // console.log(payload.content);
      console.log("accounts: " + this.accounts.length)
      console.log("ab gehts")
      this.accounts = JSON.parse(payload.content);
    });
  },
  methods: {
    startDriver() {
      // ask backend to read file
      const payload = {  };
      window.ipc.send('START_DRIVER', payload);
    },
    dudu: function(){
      alert();
    }
  }




}
</script>









<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/*
h3 {
  margin: 40px 0 0;
}
ul {

  padding: 0;
}
li {

  margin: 0 10px;
}
a {
  color: #42b983;
}*/
</style>
