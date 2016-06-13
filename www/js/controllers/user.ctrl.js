HeyCommunity

// tab.user
.controller('UserIndexCtrl', ['$scope', 'UserService', 'NoticeService', '$ionicModal', function($scope, UserService, NoticeService, $ionicModal) {
    $scope.$root.loadingShowDisabled = true;
    if ($scope.utility.isAuth()) {
        NoticeService.index();
    }
}])


//
//
.controller('UserHomeCtrl', ['$scope', 'UserService', 'NoticeService', '$ionicModal', function($scope, UserService, NoticeService, $ionicModal) {
    $scope.user = false;

    UserService.user($scope.stateParams.id).then(function(response) {
        if (response.status === 200) {
            $scope.user = response.data;
        }
    });
}])


//
.controller('UserTimelineCtrl', ['$scope', 'TimelineService', function($scope, TimelineService) {
    $scope.TimelineService = TimelineService;
    $scope.timelineFilter = {
        user_id: parseInt($scope.stateParams.user_id),
    }
    $scope.timelineFilterStrict = true;

    //
    //
    $scope.getInteractionUsers = function(timeline) {
        var str = '';
        if (timeline.like_num > 0) {
            timeline.author_like.forEach(function(author_like, $index) {
                if ($index < 4) {
                    str = str + author_like.author.nickname + ', ';
                }
            })
            str = str.substring(0, str.length - 2);
        } else {
            str += timeline.author.nickname;
        }
        return str;
    }

    //
    //
    $scope.getInteractionNum = function(timeline, text) {
        var num = parseInt(timeline.like_num) + parseInt(timeline.comment_num);
        num = num ? num : 1;
        return $scope.filter('translate')(text, {num: num})
    }


    //
    // is Like
    $scope.isLike = function(id) {
        return inArray(id, $scope.TimelineService.timelineLikes);
    }
}])



//
.controller('UserTopicCtrl', ['$scope', 'TopicService', function($scope, TopicService) {
    $scope.TopicService = TopicService;
    $scope.topicFilter = {
        user_id: parseInt($scope.stateParams.user_id),
    }
    $scope.topicFilterStrict = true;
}])



// tab.user-info
.controller('UserInfoCtrl', ['$scope', 'UserService', function($scope, UserService) {
    if ($scope.stateParams.id != $scope.$root.user.id) {
        $scope.user = {};
        $scope.isOwnInfo = false;

        UserService.user($scope.stateParams.id).then(function(response) {
            if (response.status === 200) {
                $scope.user = response.data;
            }
        });
    } else {
        $scope.isOwnInfo = true;
    }
}])



// tab.user-info-avatar
.controller('UserInfoAvatarCtrl', ['$scope', 'UserService', '$ionicActionSheet', 'Upload', '$ionicHistory', function($scope, UserService, $ionicActionSheet, Upload, $ionicHistory) {
    $scope.user.newAvatar = false;

    //
    $scope.showActionSheet = function() {
        var config = {
            buttons: [{
                text: $scope.filter('translate')('REPLACE_AVATAR')
            }],
            cancelText: $scope.filter('translate')('CANCEL'),
            cancel: function() {
            },
            buttonClicked: function(index) {
                if (index === 0) {
                    $scope.$watch('user.newAvatar', function(newVal, oldVal) {
                        console.log(newVal, oldVal);
                        if (newVal) {
                            $scope.submitAvatar();
                        }
                    })

                    $scope.selectAvatar();
                }
                hideSheet();
            },
        }

        var hideSheet = $ionicActionSheet.show(config);

        $scope.timeout(function() {
            hideSheet();
        }, 6000);
    };

    //
    $scope.selectAvatar = function() {
        angular.element('form input').click();
    }

    //
    $scope.submitAvatar = function() {
        var params = {
            avatar: $scope.user.newAvatar,
        }

        console.debug('### UserService.updateAvatar params', params);
        UserService.updateAvatar(Upload, params).then(function(response) {
            console.debug('### UserService.updateAvatar response', response);
            if (response.status == 200) {
                $scope.$root.user = response.data;
                localStorage.user = JSON.stringify(response.data);
                $ionicHistory.clearCache();
                $scope.utility.goBack();
            } else {
                $scope.utility.showAlert({title: $scope.filter('translate')('ERROR'), content: response.data});
            }
        });
    }
}])



// hey.user-setup
.controller('UserSetupCtrl', ['$scope', 'UserService', '$ionicHistory', function($scope, UserService, $ionicHistory) {
    //
    $scope.clearCache = function(){
        localStorage.removeItem('timelines');
        localStorage.removeItem('timelineLikes');
        localStorage.removeItem('topics');
        $scope.utility.showNoticeSuccess();
    }

    //
    $scope.signOut = function() {
        UserService.signOut().then(function(response) {
            if (response.status === 200) {
                $ionicHistory.clearCache();
                $scope.state.go('hey.user');
            } else {
                $scope.utility.showNoticeFail();
            }
        });
    }
}])



// hey.user-setup-accountSecurity
.controller('UserAccountSecurityCtrl', ['$scope', 'UserService', function($scope, UserService) {
}])



// hey.user-setup-accountSecurity-changePassword
.controller('UserChangePasswordCtrl', ['$scope', 'UserService', function($scope, UserService) {
    $scope.UserService = UserService;
    $scope.setNewPasswordForm = {};

    //
    $scope.setNewPassword = function() {
        var params = {
            'old_password': $scope.setNewPasswordForm.old_password,
            'new_password': $scope.setNewPasswordForm.new_password,
        };
        $scope.UserService.setNewPassword(params).then(function(response) {
            if (response.status === 200) {
                $scope.utility.showNoticeText('SET_NEW_PASSWORD_SUCCESS_PLEASE_RELOGIN');
                $scope.UserService.signOut();
                $scope.UserService.signOut();

                $scope.timeout(function() {
                    $scope.state.go('hey.user');
                }, 1000);
            }
        }, function() {
        });
    }
}])



// tab.user-setup-general-language
.controller('UserSetupGeneralLanguageCtrl', ['$scope', 'UserService', '$translate', function($scope, UserService, $translate) {
    $scope.language = localStorage.appLanguage;

    $scope.changeLanguage = function(language) {
        localStorage.appLanguage = language;
        $translate.use(language);
    }
}])



//
.controller('UserNoticeCtrl', ['$scope', 'NoticeService', '$ionicActionSheet', '$ionicListDelegate', '$cordovaBadge', function($scope, NoticeService, $ionicActionSheet, $ionicListDelegate, $cordovaBadge) {
    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true

    $scope.NoticeService = NoticeService;

    $scope.$root.loadingShowDisabled = true;
    NoticeService.index().then(function() {
        angular.forEach(NoticeService.notices, function(item, $index) {
            if (item.is_checked != 1) {
                NoticeService.check($index);
            }
        })
    });


    //
    // load more
    $scope.doRefresh = function() {
        $scope.$root.loadingShowDisabled = true;
        NoticeService.index().finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    //
    $scope.showActionSheet = function() {
        var hideSheet = $ionicActionSheet.show({
            destructiveText: $scope.filter('translate')('DESTROY_ALL'),
            titleText: $scope.filter('translate')('MANAGEMENT_OPERATIONS'),
            cancelText: $scope.filter('translate')('CANCEL'),
            buttons: [
            ],
            cancel: function() {
            },
            destructiveButtonClicked: function(index) {
                angular.forEach(NoticeService.notices, function(item, $index) {
                    NoticeService.destroy(item, $index);
                })
                hideSheet();
                // NoticeService.index();
            },
        });

        $scope.timeout(function() {
            hideSheet();
        }, 2000);
    };

    //
    $scope.check = function(item, $index) {
        NoticeService.check($index);
        $ionicListDelegate.closeOptionButtons();
    }

    //
    $scope.destroy = function(item, $index) {
        NoticeService.destroy(item, $index);
        $ionicListDelegate.closeOptionButtons();
    }

    //
    $scope.goState = function(item) {
        if (item.type.name === 'timeline_like' || item.type.name === 'timeline_comment') {
            $scope.state.go('hey.timeline-detail', {timelineId: item.noticeable_id})
        } else if (item.type.name === 'topic_like' || item.type.name === 'topic_comment') {
            $scope.state.go('hey.topic-detail', {topicId: item.noticeable_id})
        }
    }
}])
