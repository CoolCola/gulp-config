/**
 * Created by colazhang on 2018/3/15.
 */
/** 参考链接：http://www.qiqiboy.com/post/61
 * https://github.com/lin-xin/blog/issues/2
 * https://dtcz.github.io/posts/2017/02/26/gulp-settings.html
 * https://github.com/chimurai/http-proxy-middleware/blob/master/examples/browser-sync/index.js
 * */
var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var proxy = require('http-proxy-middleware');
var gulpif = require('gulp-if');
var changed = require('gulp-changed'); // 过滤变动的文件
var plumber = require('gulp-plumber'); //捕获异常，防止编译过程意外退出

var proxyTable = {
    project: proxy([

    ],{
        target: '',
        changeOrigin: true,
        logLevel: 'debug'
    })
};

var tasks = {
    project: {
        name: 'project',// task名
        lessPath: ['project/**/*.less'], // less路径
        bsConfig: {// browsersync参数
            port: 8000,// 静态服务器的端口
            ui: {port: 3001, weinre: {port: 8081}}, // 多个项目需配置不同的端口
            server: {
                baseDir: "./project",
                index: "index.html"
            },
            files: ['project/**/*.css','project/**/*.html'], // 监听文件
            injectChanges: true, // css无刷新注入
            notify:false, //不显示browser通知信息
            middleware: proxyTable.project
        }
    }
};

function createTask(taskConfig) {
    gulp.task(taskConfig.name, (function (opt) {
        var bs = browserSync.create();// 这里需新建实例
        bs.watch('*.html').on('change', bs.reload);// 监听html变化自动刷新html
        bs.init(taskConfig.bsConfig);// 启动静态服务器
        gulp.watch(opt.lessPath, function () {
            console.time('project less cost');
            // 编译后的css文件与less同目录
            // 新的change最新参数compareContents，compareSha1Digest已经废弃
            var steam = gulp.src(opt.lessPath, {base: './'})
                .pipe(plumber())
                .pipe(less())
                .pipe(gulpif(opt.name === 'project', autoprefixer({
                    cascade: true,
                    browsers: ['Chrome >= 16', 'Firefox >= 11', 'ie >= 10', 'Opera >= 12.1', 'Safari >= 7'],
                })))
                .pipe(changed('./', {hasChanged: changed.compareSha1Digest}))
                .pipe(gulp.dest('./'));
            console.timeEnd('project less cost');
            return steam;
        });
    })(taskConfig));
}

createTask(tasks.project);
gulp.task('default', ['project']);