<template>
    <div>
        <h4>Add track</h4>
        <form>
            <label for="title">Title
                <input id="title" type="text" v-model="title" required autofocus>
            </label>
            <br>
            <label for="duration">Duration
                <input id="duration" type="text" v-model="duration" required autofocus>
            </label>
            <br>
            <label for="file">File
                <input type="file" id="file" accept="audio/*" ref="file" v-on:change="handleFileUpload()"/>
             </label>
            <br>
            <div>
                <button type="submit" @click="handleSubmit">
                    add
                </button>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: ['id'],
        name: 'catalog-add',
        data(){
            return {
                title : "",
                duration:"",
                track:""
            }
        },
        methods : {
            handleSubmit(e) {
                e.preventDefault()
                //TODO: field validation
                if (this.title.length > 4 && !isNaN(this.duration) && this.track && this.id)
                {
                    let url = "/api/track"
                    let formData = new FormData();
                    
                    formData.append('title', this.title);
                    formData.append('duration', this.duration);
                    formData.append('track', this.track);
                    formData.append('catalog', this.id);
                    
                    this.$http.post(url, formData, {
                      headers: {
                        'x-access-token': localStorage.getItem('jwt'),
                        'Content-Type': 'multipart/form-data'
                      }
                    })
                    .then(response => {
                        this.$router.push('/')
                    })
                    .catch(error => {
                        console.error(error);
                    });
                    //TODO: error(serv/valid) handling
                }
            },
             handleFileUpload(){
                this.track = this.$refs.file.files[0];
              }
        }
    }
</script>

