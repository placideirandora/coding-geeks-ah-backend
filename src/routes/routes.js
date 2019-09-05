import express from 'express';
import passport from 'passport';
import connectmultiparty from 'connect-multiparty';
import Validation from '../middleware/validation';
import ContentType from '../middleware/contentType';
import UserAuth from '../controllers/userController';
import verifyToken from '../middleware/verifyToken';
import googleRequest from '../middleware/google';
import twitterRequest from '../middleware/twitter';
import facebookRequest from '../middleware/facebook';
import UserFollow from '../controllers/followController';
import Profile from '../controllers/profileController';
import canEditProfile from '../middleware/editProfile';
import { adminPermission, checkAdmin } from '../middleware/adminPermissions';
import Article from '../controllers/articleController';
import articleRate from '../controllers/ratingController';
import ArticleMiddleware from '../middleware/articleMiddleware';
import Notification from '../controllers/notificationController';
import findOwner from '../middleware/findOwner';
import Bookmark from '../controllers/bookmarkController';
import findUser from '../middleware/findUser';
import Highlights from '../controllers/higlightController';
import Report from '../controllers/reportController';
import CommentReaction from '../controllers/commentController';


const router = express.Router();

const connectMulti = connectmultiparty();

router.post('/api/v1/users/signup', Validation.signupValidation, UserAuth.signup);
router.post('/api/v1/users', verifyToken, adminPermission, Validation.signupValidation, UserAuth.signup);
router.get('/api/v1/profiles/:username', Profile.user);
router.get('/api/v1/profiles', verifyToken, Profile.fetchProfiles);
router.put('/api/v1/profiles/:username', [verifyToken, connectMulti, canEditProfile, Validation.profileValidation, Validation.imageValidation], Profile.editProfile);
router.post('/api/v1/send-email', Validation.emailValidation, UserAuth.emailSender);
router.post('/api/v1/reset-password/:token', verifyToken, Validation.passwordValidation, UserAuth.resetPassword);
router.get('/api/v1/verify-email/:token', verifyToken, UserAuth.verifyEmail);
router.post('/api/v1/send-email', Validation.emailValidation, UserAuth.emailSender);
router.post('/api/v1/reset-password/:token', verifyToken, Validation.passwordValidation, UserAuth.resetPassword);
router.post('/api/v1/login', Validation.loginValidation, UserAuth.login);
router.get('/api/v1/auth/facebook', passport.authenticate('facebook', { session: false, scope: ['email'] }));
router.get('/api/v1/auth/facebook/test', facebookRequest, UserAuth.facebookLogin);
router.get('/api/v1/auth/facebook/callback', passport.authenticate('facebook'), UserAuth.facebookLogin);
router.get('/api/v1/auth/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/api/v1/auth/google/test', googleRequest, UserAuth.googleLogin);
router.get('/api/v1/auth/google/callback', passport.authenticate('google'), UserAuth.googleLogin);
router.get('/api/v1/auth/twitter', passport.authenticate('twitter', { session: true, scope: ['email'] }));
router.get('/api/v1/auth/twitter/test', twitterRequest, UserAuth.twitterLogin);
router.get('/api/v1/auth/twitter/callback', passport.authenticate('twitter'), UserAuth.twitterLogin);
router.post('/api/v1/users/logout', [verifyToken], UserAuth.logout);
router.post('/api/v1/users/login', Validation.loginValidation, UserAuth.login);
router.delete('/api/v1/users/:username', verifyToken, UserAuth.deleteUser);
router.patch('/api/v1/users/:username', verifyToken, adminPermission, Validation.updateRoleValidation, UserAuth.updateRole);
router.get('/api/v1/articles/:slug', Article.getSingleArticle);
router.post('/api/v1/articles', [verifyToken, connectMulti, Validation.createArticleValidation, ContentType, Validation.imageValidation], Article.createArticle);
router.get('/api/v1/articles', ArticleMiddleware.validQueries, Article.getAllArticles);
router.post('/api/v1/articles/:articleId/rate', [verifyToken, Validation.idValidation, ArticleMiddleware.checkRatedArticle], articleRate.rateArticle);
router.get('/api/v1/articles/:articleId/rate', [verifyToken, Validation.idValidation, findOwner], articleRate.getArticleRating);
router.put('/api/v1/articles/:articleSlug/like', verifyToken, Article.likeArticle);
router.put('/api/v1/articles/:articleSlug/dislike', verifyToken, Article.dislikeArticle);
router.post('/api/v1/articles/:articleSlug/comments', verifyToken, Validation.commentValidation, Article.commentArticle);
router.get('/api/v1/articles/:articleSlug/comments', verifyToken, Article.retrieveComments);
router.patch('/api/v1/articles/:articleSlug/comments/:commentId', verifyToken, Validation.commentValidation, Validation.commentParamsValidation, Article.updateComment);
router.delete('/api/v1/articles/:articleSlug/comments/:commentId', verifyToken, Validation.commentParamsValidation, Article.deleteComment);
router.post('/api/v1/profiles/:userName/follow', verifyToken, UserFollow.followUser);
router.delete('/api/v1/profiles/:userName/unfollow', verifyToken, UserFollow.unFollowUser);
router.get('/api/v1/profiles/:userName/following', verifyToken, UserFollow.getFollowingList);
router.get('/api/v1/profiles/:userName/followers', verifyToken, UserFollow.getFollowersList);
router.delete('/api/v1/articles/:slug', [verifyToken, findOwner], Article.deteleArticle);
router.put('/api/v1/articles/:slug', [verifyToken, findOwner, connectMulti, Validation.updateArticleValidation, ContentType, Validation.imageValidation], Article.updateArticle);
router.post('/api/v1/articles/:slug/share/:option', [verifyToken, ArticleMiddleware.validPlatform], Article.shareArticle);
router.patch('/api/v1/profiles/:username/notifications/:subscribe', [verifyToken, canEditProfile], Notification.optInOutNotificatation);
router.get('/api/v1/profiles/notifications/all', verifyToken, Notification.getNotification);
router.patch('/api/v1/profiles/notifications/:id/read', verifyToken, Notification.readOneNotification);
router.patch('/api/v1/profiles/notifications/read/all', verifyToken, Notification.readAllNotification);
router.post('/api/v1/bookmarks/:slug', [verifyToken, findUser], Bookmark.createBookmark);
router.get('/api/v1/bookmarks', [verifyToken, findUser], Bookmark.getBookmarks);
router.delete('/api/v1/bookmarks/:slug', [verifyToken, findUser], Bookmark.deleteBookmark);
router.post('/api/v1/articles/:slug/highlights', verifyToken, Validation.highlightValidation, Highlights.highlightText);
router.get('/api/v1/articles/:articleSlug/statistics', verifyToken, Article.readingStats);
router.post('/api/v1/articles/:articleSlug/reports', [verifyToken, Validation.reportValidation], Report.createReport);
router.get('/api/v1/articles/reports/all', [verifyToken, checkAdmin], Report.getAllReports);
router.get('/api/v1/articles/:articleSlug/reports', [verifyToken, checkAdmin], Report.getArticleReports);
router.delete('/api/v1/articles/:articleSlug/reports/:reportId', verifyToken, Validation.reportParamsValidation, Report.deleteReport);
router.get('/api/v1/articles/:articleSlug/reports/:reportId', [verifyToken, checkAdmin, Validation.reportParamsValidation], Report.getSingleReport);
router.put('/api/v1/comments/:id/like', [verifyToken, findUser, Validation.idInParamsValidation], CommentReaction.likeComment);
router.put('/api/v1/comments/:id/dislike', [verifyToken, findUser, Validation.idInParamsValidation], CommentReaction.dislikeComment);
router.put('/api/v1/articles/:articleSlug/block', [verifyToken, checkAdmin], Article.blockArticle);
router.put('/api/v1/articles/:articleSlug/unblock', [verifyToken, checkAdmin], Article.unblockArticle);
router.put('/api/v1/users/:username/block', [verifyToken, checkAdmin], UserAuth.blockerUser);
router.put('/api/v1/users/:username/unblock', [verifyToken, checkAdmin], UserAuth.unblockerUser);
export default router;
