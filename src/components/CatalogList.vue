<template>
  <div class="tracks">
    <router-link :to="{ name: 'track-add', params: { id: id } }">Add</router-link>
    <p class="track" v-for="track in tracks" v-bind:key="track.id">
        <span> 
            {{ track.title }} 
        </span>
        <span> 
            {{ track.duration }} 
        </span>
    </p>
  </div>
</template>

<script>
 
export default {
  props: ['id'],
  name: 'catalog-list',
  data () {
    return {
      tracks: null,
      endpoint: '/api/tracks/',
    }
  },
  created () {
    this.getTracks(this.id);
  },
  methods: {
    getTracks(id) {
      this.$http(this.endpoint + id)
        .then(response => {
          this.tracks = response.data
          console.log(this.tracks);
        })
        .catch( error => {
          console.log(error)
        })
    }
  },
  watch: {
    '$route'() {
      this.getTracks(this.id);
    }
  }
}
</script>

<style>
</style>
