<template>
  <div class="home">
    <!--p> {{ vari }}</p>
    <p> {{ varilx }}</p>
    <button v-on:click="readFile('/Users/alexandermathieu/test2.txt')"> click read</button>
    <button v-on:click="lx('/Users/alexandermathieu/test2.txt')"> click </button-->
    <AccountTable />
  </div>
</template>

<script>
import AccountTable from '@/components/AccountTable.vue'
export default {
  name: 'App',
  data: function () {
    return {
      vari: 0,
      varilx: 0,
    }
  },
  components: {
    AccountTable
  },
  mounted() {
    // handle reply from the backend
    window.ipc.on('READ_FILE', (payload) => {
      console.log(payload.content);
      this.vari = payload.content
    });

    window.ipc.on('READ_LX', (payload) => {
      console.log(payload.content);
      this.varilx = payload.content
    });
  },
  methods: {
    readFile(path) {
      // ask backend to read file
      const payload = { path };
      window.ipc.send('READ_FILE', payload);
    },
    lx(path) {
      // ask backend to read file
      const payload = { path };
      window.ipc.send('READ_LX', payload);
    },
  },
};
</script>



<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
